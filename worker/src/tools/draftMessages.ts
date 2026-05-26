/**
 * draftMessages - Subconscious AI message drafting
 * Generates customer communication and internal notes
 */

import type { DispositionCode } from './decide';

export interface DraftMessages {
  carrier_message?: string;
  customer_message?: string;
  ar_note: string;
}

export async function draftMessages(
  dispositionCode: DispositionCode,
  exceptionId: string,
  customerName: string,
  orderSku: string,
  dollarImpact: number,
  reasoning: string,
  apiKey: string,
  carrier?: string
): Promise<DraftMessages> {

  const systemMessage = `You are a Wayfair freight ops writer.

CRITICAL: Your response must be ONLY a valid JSON object. No explanation. No thinking process. No markdown. Just the JSON.

Return this exact structure:
{
  "carrier_message": "email to the carrier about this case",
  "customer_message": "email to the customer about their order",
  "ar_note": "one line note to accounting"
}

DO NOT include any text outside the JSON object. DO NOT include thinking process or explanation.`;

  const userMessage = `Disposition: ${dispositionCode}
Reasoning: ${reasoning}
Customer: ${customerName}
Order: ${orderSku}
Carrier: ${carrier || 'Unknown'}
Dollar impact: ${dollarImpact}
Write the 3 messages.`;

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
        temperature: 0.3,
        max_tokens: 600,
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

    console.log('[draftMessages] Raw Subconscious response:', content.substring(0, 300));

    // Strip <think> tags if present
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '');

    // Remove markdown code blocks
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Try to find JSON object - look for the LAST occurrence to skip any thinking text
    const jsonMatches = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
    if (!jsonMatches || jsonMatches.length === 0) {
      console.error('[draftMessages] No JSON found in response:', content);
      throw new Error('No JSON found in response');
    }

    // Use the last JSON object found (most likely to be the actual response)
    const result = JSON.parse(jsonMatches[jsonMatches.length - 1]);

    console.log('[draftMessages] Parsed drafts');

    return result;

  } catch (error) {
    console.error('[draftMessages] Subconscious API error, using fallback:', error);

    // Fallback templates
    return getFallbackDrafts(dispositionCode, customerName, orderSku, dollarImpact, reasoning, carrier);
  }
}

function getFallbackDrafts(
  dispositionCode: DispositionCode,
  customerName: string,
  orderSku: string,
  dollarImpact: number,
  reasoning: string,
  carrier?: string
): DraftMessages {

  const templates: Record<DispositionCode, DraftMessages> = {
    CARRIER_LIABILITY: {
      carrier_message: `Claim filing for order ${orderSku}. ${reasoning}. Claim amount: $${dollarImpact}. Please process carrier liability claim.`,
      customer_message: `Dear ${customerName}, We've identified damage to your order ${orderSku} that occurred during shipping. We're processing a replacement at no charge. You should receive it within 3-5 business days.`,
      ar_note: `Carrier claim filed - ${dispositionCode} - $${dollarImpact}`
    },
    WRITE_OFF: {
      carrier_message: undefined,
      customer_message: `Dear ${customerName}, Regarding order ${orderSku}, we've determined this item cannot be recovered. We're processing your refund of $${dollarImpact}.`,
      ar_note: `Write-off approved - ${orderSku} - $${dollarImpact}`
    },
    FULL_REFUND: {
      carrier_message: undefined,
      customer_message: `Dear ${customerName}, We sincerely apologize for the issue with order ${orderSku}. We've processed a full refund of $${dollarImpact} to your original payment method. You should see this within 3-5 business days.`,
      ar_note: `Full refund processed - Premium customer - $${dollarImpact}`
    },
    CREDIT_MEMO: {
      carrier_message: undefined,
      customer_message: `Dear ${customerName}, We apologize for the issue with order ${orderSku}. We've issued a credit of $${dollarImpact} to your Wayfair account for future purchases.`,
      ar_note: `Credit memo issued - ${orderSku} - $${dollarImpact}`
    },
    RESCHEDULE: {
      carrier_message: `Reschedule request for order ${orderSku}. Customer ${customerName} requires new delivery window. Order value: $${dollarImpact}.`,
      customer_message: `Dear ${customerName}, We apologize for missing your delivery. We've rescheduled your order ${orderSku} for tomorrow 4-6pm. A team member will call 30 minutes before arrival.`,
      ar_note: `Delivery rescheduled - fee waived - ${orderSku}`
    },
    ESCALATE: {
      carrier_message: undefined,
      customer_message: undefined,
      ar_note: `Escalated to Maria - low confidence - ${orderSku} - $${dollarImpact}`
    }
  };

  return templates[dispositionCode];
}
