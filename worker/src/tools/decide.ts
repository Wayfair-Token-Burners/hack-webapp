/**
 * decide - Subconscious AI decision tool
 * Makes disposition decisions based on gathered evidence
 */

import type { OrderLookupResult } from './lookupOrder';
import type { PhotoAnalysis } from './readPhoto';
import type { AudioTranscription } from './transcribeAudio';

export type DispositionCode =
  | 'CARRIER_LIABILITY'
  | 'WRITE_OFF'
  | 'FULL_REFUND'
  | 'CREDIT_MEMO'
  | 'ESCALATE'
  | 'RESCHEDULE';

export interface DecisionResult {
  disposition_code: DispositionCode;
  confidence: number;
  reasoning: string;
  dollar_impact: number;
}

export async function decide(
  orderData: OrderLookupResult,
  photoAnalysis: PhotoAnalysis | null,
  audioTranscript: AudioTranscription | null,
  apiKey: string
): Promise<DecisionResult> {
  const exception = orderData.exception;
  if (!exception) {
    return {
      disposition_code: 'ESCALATE',
      confidence: 0,
      reasoning: 'Exception not found',
      dollar_impact: 0
    };
  }

  // Build user message from tool inputs
  const photoText = photoAnalysis?.analysis_text || 'No photo analysis available';
  const audioText = audioTranscript?.transcript || 'no voicemail';
  const carrier = orderData.carrier || 'Unknown carrier';
  const customerTier = orderData.order?.ltv_band || 'Unknown';
  const dollarImpact = orderData.dollar_impact || 0;
  const bolNotes = exception.bol_notes || 'none';

  const systemMessage = `You are a freight exception resolver for Wayfair.

CRITICAL: Your response must be ONLY a valid JSON object. No explanation. No thinking process. No markdown. Just the JSON.

Return this exact structure:
{
  "disposition_code": "CARRIER_LIABILITY or WRITE_OFF or FULL_REFUND or CREDIT_MEMO or ESCALATE or RESCHEDULE",
  "confidence": 0.95,
  "reasoning": "one sentence explaining the decision",
  "dollar_impact": ${dollarImpact}
}

Rules:
- If confidence < 0.6, set disposition_code to ESCALATE
- If BOL notes contain 'salvage value $0' or 'display sample', set disposition_code to WRITE_OFF regardless of photo damage severity
- DO NOT include any text outside the JSON object
- DO NOT include thinking process or explanation`;

  const userMessage = `Photo analysis: ${photoText}
Driver voicemail: ${audioText}
Carrier: ${carrier}
Customer tier: ${customerTier}
Dollar impact: ${dollarImpact}
BOL notes: ${bolNotes}
Make a disposition decision.`;

  try {
    // Create abort controller for 10 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.subconscious.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'subconscious/tim-qwen3.6-27b',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Subconscious API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    console.log('[decide] Raw Subconscious response:', content.substring(0, 300));

    // Strip <think> tags if present
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '');

    // Remove markdown code blocks
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Try to find JSON object - look for the LAST occurrence to skip any thinking text
    const jsonMatches = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
    if (!jsonMatches || jsonMatches.length === 0) {
      console.error('[decide] No JSON found in response:', content);
      throw new Error('No JSON found in response');
    }

    // Use the last JSON object found (most likely to be the actual response)
    const result = JSON.parse(jsonMatches[jsonMatches.length - 1]);

    // Validate and enforce low confidence escalation
    if (result.confidence < 0.6) {
      result.disposition_code = 'ESCALATE';
    }

    // Ensure dollar_impact is present
    if (!result.dollar_impact) {
      result.dollar_impact = dollarImpact;
    }

    console.log('[decide] Parsed decision:', result);

    return result;

  } catch (error) {
    console.error('[decide] Subconscious API error, using fallback:', error);

    // Fallback: simple rule-based decision
    return getFallbackDecision(exception, photoAnalysis, audioTranscript, dollarImpact);
  }
}

// Simple fallback if API fails
function getFallbackDecision(
  exception: any,
  photoAnalysis: PhotoAnalysis | null,
  audioTranscript: AudioTranscription | null,
  dollarImpact: number
): DecisionResult {
  // Check BOL notes for display sample or salvage value $0
  if (exception.bol_notes) {
    const bolLower = exception.bol_notes.toLowerCase();
    if (bolLower.includes('salvage value $0') || bolLower.includes('display sample')) {
      return {
        disposition_code: 'WRITE_OFF',
        confidence: 0.95,
        reasoning: 'BOL indicates display sample with zero salvage value',
        dollar_impact: dollarImpact
      };
    }
  }

  // Check for carrier fault admission
  if (audioTranscript?.fault_admission && photoAnalysis?.damage_detected) {
    return {
      disposition_code: 'CARRIER_LIABILITY',
      confidence: 0.85,
      reasoning: 'Driver admitted fault and damage confirmed',
      dollar_impact: dollarImpact
    };
  }

  // Check for low confidence photo
  if (photoAnalysis && photoAnalysis.confidence < 0.6) {
    return {
      disposition_code: 'ESCALATE',
      confidence: photoAnalysis.confidence,
      reasoning: 'Low confidence in damage assessment',
      dollar_impact: dollarImpact
    };
  }

  // Check customer tier for short-ship cases
  if (exception.type === 'short_ship') {
    if (exception.order.ltv_band === 'Platinum' || exception.order.ltv_band === 'Gold') {
      return {
        disposition_code: 'FULL_REFUND',
        confidence: 0.9,
        reasoning: 'Premium customer short-ship gets full refund',
        dollar_impact: dollarImpact
      };
    } else {
      return {
        disposition_code: 'CREDIT_MEMO',
        confidence: 0.9,
        reasoning: 'Standard customer short-ship gets credit memo',
        dollar_impact: dollarImpact
      };
    }
  }

  // Check for missed appointment
  if (exception.type === 'missed_appointment') {
    return {
      disposition_code: 'RESCHEDULE',
      confidence: 0.95,
      reasoning: 'Missed appointment requires rescheduling',
      dollar_impact: dollarImpact
    };
  }

  // Default to escalation
  return {
    disposition_code: 'ESCALATE',
    confidence: 0.3,
    reasoning: 'Unable to make confident decision',
    dollar_impact: dollarImpact
  };
}
