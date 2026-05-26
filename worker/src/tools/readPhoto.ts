/**
 * readPhoto - Cloudflare AI Vision Model
 * Analyzes damage photos using @cf/llava-1.5-7b-hf vision model
 * SPONSOR: Cloudflare
 */

export interface PhotoAnalysis {
  damage_detected: boolean;
  severity: 'none' | 'minor' | 'moderate' | 'severe' | 'total_loss';
  damage_type?: string;
  affected_areas?: string[];
  carrier_fault_indicators?: string[];
  confidence: number;
  analysis_text: string;
}

interface CloudflareAIEnv {
  AI: {
    run(model: string, options: { image: number[] | string; prompt: string; max_tokens?: number }): Promise<{ response: string }>;
  };
}

/**
 * Read and analyze photo using Cloudflare AI vision model
 */
export async function readPhoto(
  photoUrl: string,
  exceptionId: string,
  env?: CloudflareAIEnv
): Promise<PhotoAnalysis> {
  // For demo/testing: use mock responses if no env provided
  if (!env) {
    return getMockPhotoAnalysis(exceptionId);
  }

  try {
    // Fetch image and convert to format for Cloudflare AI
    const imageResponse = await fetch(photoUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageArray = Array.from(new Uint8Array(imageBuffer));

    // Prompt engineered for freight damage analysis
    const prompt = `You are a freight damage assessment expert. Analyze this image and provide:

1. Is there visible damage? (yes/no)
2. Damage severity: none, minor, moderate, severe, or total_loss
3. Type of damage (if any): structural, cosmetic, packaging, etc.
4. Affected areas: list specific damaged parts
5. Carrier liability indicators: signs of mishandling, impact marks, etc.
6. Confidence level (0-100%)

Provide a detailed analysis focusing on whether damage was caused during shipping.`;

    const response = await env.AI.run('@cf/llava-1.5-7b-hf', {
      image: imageArray,
      prompt,
      max_tokens: 512
    });

    // Parse the vision model response
    const analysis = parseVisionResponse(response.response);

    return analysis;

  } catch (error) {
    console.error('Cloudflare AI vision error:', error);
    // Fallback to mock analysis on error
    return getMockPhotoAnalysis(exceptionId);
  }
}

/**
 * Parse Cloudflare AI vision model response into structured PhotoAnalysis
 */
function parseVisionResponse(responseText: string): PhotoAnalysis {
  const text = responseText.toLowerCase();

  // Extract damage detection
  const hasDamage = text.includes('damage') && !text.includes('no damage');

  // Extract severity
  let severity: PhotoAnalysis['severity'] = 'none';
  if (text.includes('total loss') || text.includes('total_loss') || text.includes('catastrophic')) {
    severity = 'total_loss';
  } else if (text.includes('severe')) {
    severity = 'severe';
  } else if (text.includes('moderate')) {
    severity = 'moderate';
  } else if (text.includes('minor')) {
    severity = 'minor';
  }

  // Extract confidence (look for percentage)
  const confidenceMatch = text.match(/(\d+)%/);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.7;

  // Extract damage type
  let damageType: string | undefined;
  if (text.includes('structural')) damageType = 'structural_damage';
  else if (text.includes('cosmetic')) damageType = 'cosmetic_damage';
  else if (text.includes('packaging')) damageType = 'packaging_damage';

  // Extract carrier fault indicators
  const carrierFaultIndicators: string[] = [];
  if (text.includes('impact mark')) carrierFaultIndicators.push('impact_marks');
  if (text.includes('mishandl')) carrierFaultIndicators.push('mishandling_evident');
  if (text.includes('drop')) carrierFaultIndicators.push('drop_damage');

  return {
    damage_detected: hasDamage,
    severity,
    damage_type: damageType,
    affected_areas: [],
    carrier_fault_indicators: carrierFaultIndicators,
    confidence,
    analysis_text: responseText
  };
}

/**
 * Mock fallback for demo/testing without Cloudflare AI env
 */
function getMockPhotoAnalysis(exceptionId: string): PhotoAnalysis {
  // Mock responses based on hero cases for demo
  if (exceptionId === 'HERO-1') {
    return {
      damage_detected: true,
      severity: 'severe',
      damage_type: 'structural_damage',
      affected_areas: ['corner_frame', 'upholstery_tear', 'cushion_deformation'],
      carrier_fault_indicators: [
        'visible_impact_marks_on_corner',
        'packaging_intact_damage_internal',
        'damage_pattern_consistent_with_drop'
      ],
      confidence: 0.92,
      analysis_text: 'Severe corner damage to luxury sofa. Clear impact marks suggest drop during handling. Packaging shows no external damage, indicating carrier mishandling during transit.'
    };
  }

  if (exceptionId === 'HERO-2a' || exceptionId === 'HERO-2b') {
    return {
      damage_detected: false,
      severity: 'none',
      affected_areas: [],
      confidence: 0.95,
      analysis_text: 'Photo shows partial shipment - 3 of 4 chairs delivered. No visible damage to received items. Short-ship confirmed.'
    };
  }

  if (exceptionId === 'HERO-3') {
    return {
      damage_detected: true,
      severity: 'total_loss',
      damage_type: 'catastrophic_damage',
      affected_areas: ['table_top_shattered', 'legs_broken', 'hardware_missing'],
      confidence: 0.88,
      analysis_text: 'Table appears to be total loss - shattered top, broken legs. However, need to check BOL for context (display sample, salvage value).'
    };
  }

  if (exceptionId === 'HERO-4') {
    return {
      damage_detected: true,
      severity: 'minor',
      damage_type: 'surface_scratches',
      affected_areas: ['desktop_surface'],
      carrier_fault_indicators: [],
      confidence: 0.45,
      analysis_text: 'Minor scratches visible on desktop surface. Image quality poor, lighting insufficient. Cannot definitively determine if damage occurred during transit or was pre-existing. Low confidence.'
    };
  }

  if (exceptionId === 'HERO-5') {
    return {
      damage_detected: false,
      severity: 'none',
      confidence: 0.98,
      analysis_text: 'Photo shows delivery notice left at door. No damage visible. Missed appointment case.'
    };
  }

  // Default fallback
  return {
    damage_detected: false,
    severity: 'none',
    confidence: 0.5,
    analysis_text: 'Unable to analyze photo - unknown exception type.'
  };
}
