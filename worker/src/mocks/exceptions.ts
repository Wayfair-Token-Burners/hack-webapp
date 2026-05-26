/**
 * Hero Case Mock Data for Exception Processing
 *
 * These are the 5 hero cases that demonstrate the core AI agent capabilities:
 * 1. HERO-1: Damage with photo + driver voicemail → carrier liability
 * 2. HERO-2a/2b: Same SKU short-ship, different LTV bands → different resolutions
 * 3. HERO-3: Apparent total loss but BOL shows display sample → write off
 * 4. HERO-4: Low confidence carrier dispute → escalate to Maria
 * 5. HERO-5: Missed appointment → reschedule within 2hr window
 */

export interface Exception {
  exception_id: string;
  type: string;
  status: string;
  order: {
    id: string;
    sku: string;
    customer_name: string;
    ltv_band: string;
    sla_tier: string;
  };
  evidence: {
    photo_url?: string;
    audio_url?: string;
    pdf_url?: string;
  };
  carrier: string;
  dollar_impact: number;
  bol_notes?: string;
}

export const MOCK_EXCEPTIONS: Exception[] = [
  // HERO-1: Damage with photo + driver voicemail admitting fault → carrier liability
  {
    exception_id: "HERO-1",
    type: "damage",
    status: "under_review",
    order: {
      id: "WF-ORD-2024-78342",
      sku: "WF-SOFA-LX-GRY",
      customer_name: "Sarah Mitchell",
      ltv_band: "Gold",
      sla_tier: "Priority"
    },
    evidence: {
      photo_url: "https://evidence.wayfair.com/photos/HERO-1-damage-sofa-corner.jpg",
      audio_url: "https://evidence.wayfair.com/audio/HERO-1-driver-voicemail.mp3",
      pdf_url: "https://evidence.wayfair.com/docs/HERO-1-delivery-receipt.pdf"
    },
    carrier: "FedEx Freight",
    dollar_impact: 1847.99
  },

  // HERO-2a: Short-ship, Platinum LTV → refund
  {
    exception_id: "HERO-2a",
    type: "short_ship",
    status: "open",
    order: {
      id: "WF-ORD-2024-91255",
      sku: "WF-CHAIR-DN-NAV",
      customer_name: "Michael Chen",
      ltv_band: "Platinum",
      sla_tier: "Premium"
    },
    evidence: {
      photo_url: "https://evidence.wayfair.com/photos/HERO-2a-partial-shipment.jpg",
      pdf_url: "https://evidence.wayfair.com/docs/HERO-2a-packing-slip.pdf"
    },
    carrier: "XPO Logistics",
    dollar_impact: 425.50
  },

  // HERO-2b: Short-ship, Standard LTV → credit memo
  {
    exception_id: "HERO-2b",
    type: "short_ship",
    status: "open",
    order: {
      id: "WF-ORD-2024-91267",
      sku: "WF-CHAIR-DN-NAV",
      customer_name: "Jennifer Lopez",
      ltv_band: "Standard",
      sla_tier: "Standard"
    },
    evidence: {
      photo_url: "https://evidence.wayfair.com/photos/HERO-2b-missing-items.jpg",
      pdf_url: "https://evidence.wayfair.com/docs/HERO-2b-packing-slip.pdf"
    },
    carrier: "XPO Logistics",
    dollar_impact: 425.50
  },

  // HERO-3: Looks like total loss but BOL says display sample → write off
  {
    exception_id: "HERO-3",
    type: "total_loss",
    status: "under_review",
    order: {
      id: "WF-ORD-2024-83491",
      sku: "WF-TABLE-CT-OAK",
      customer_name: "Robert Davidson",
      ltv_band: "Silver",
      sla_tier: "Standard"
    },
    evidence: {
      photo_url: "https://evidence.wayfair.com/photos/HERO-3-damaged-table.jpg",
      pdf_url: "https://evidence.wayfair.com/docs/HERO-3-bol-display-sample.pdf"
    },
    carrier: "Estes Express",
    dollar_impact: 892.00,
    bol_notes: "display sample unit - salvage value $0 - no carrier claim applicable per warehouse disposition policy"
  },

  // HERO-4: Low confidence carrier dispute → escalate to Maria
  {
    exception_id: "HERO-4",
    type: "carrier_dispute",
    status: "pending_escalation",
    order: {
      id: "WF-ORD-2024-95673",
      sku: "WF-DESK-EX-WHT",
      customer_name: "Amanda Rodriguez",
      ltv_band: "Gold",
      sla_tier: "Priority"
    },
    evidence: {
      photo_url: "https://evidence.wayfair.com/photos/HERO-4-inconclusive-damage.jpg",
      pdf_url: "https://evidence.wayfair.com/docs/HERO-4-carrier-dispute-form.pdf"
    },
    carrier: "Old Dominion",
    dollar_impact: 1234.75
  },

  // HERO-5: Missed appointment → reschedule within 2hr window
  {
    exception_id: "HERO-5",
    type: "missed_appointment",
    status: "open",
    order: {
      id: "WF-ORD-2024-88920",
      sku: "WF-BED-KG-ESO",
      customer_name: "David Thompson",
      ltv_band: "Platinum",
      sla_tier: "Premium"
    },
    evidence: {
      photo_url: "https://evidence.wayfair.com/photos/HERO-5-no-delivery-notice.jpg",
      pdf_url: "https://evidence.wayfair.com/docs/HERO-5-delivery-schedule.pdf"
    },
    carrier: "Pilot Freight",
    dollar_impact: 2156.00
  }
];

// Backward compatibility
export const HERO_CASES = MOCK_EXCEPTIONS;

// Export individual cases for testing
export const [
  HERO_1_DAMAGE_CARRIER_LIABILITY,
  HERO_2A_SHORTSHIP_PLATINUM_REFUND,
  HERO_2B_SHORTSHIP_STANDARD_CREDIT,
  HERO_3_DISPLAY_SAMPLE_WRITEOFF,
  HERO_4_LOW_CONFIDENCE_ESCALATE,
  HERO_5_MISSED_APPOINTMENT_RESCHEDULE
] = MOCK_EXCEPTIONS;
