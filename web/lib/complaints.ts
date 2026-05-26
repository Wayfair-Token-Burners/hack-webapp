// Schema-aligned freight-exception data layer.
// Mirrors db/schema.sql (D1 / SQLite). Seven inbox rows are anchored to the
// hand-planted hero / supporting cases in db/seed.sql:
//   ex_001 — HERO-1   damaged_pallet + photo + audio + pdf (multimodal fusion)
//   ex_002 — HERO-2a  os_d_short, platinum customer (refund + replacement)
//   ex_003 — HERO-2b  os_d_short, standard customer (credit memo)
//   ex_007 — HERO-3   damaged_pallet but salvage value $0 (write off, no claim)
//   ex_012 — HERO-4   carrier_dispute, low confidence (must escalate)
//   ex_018 —          bol_mismatch with AR-invoice evidence
//   ex_023 — HERO-5   missed_appt with 2-hour reschedule window

// ─────────────────────────────────────────────────────────────────────────────
// Schema-aligned types (mirror db/schema.sql)
// ─────────────────────────────────────────────────────────────────────────────

export type LtvBand = "platinum" | "gold" | "standard";
export type SlaTier = "tier1" | "tier2" | "tier3";

export type ExceptionStatus = "open" | "resolved" | "escalated";
export type ExceptionType =
  | "damaged_pallet"
  | "os_d_short"
  | "missed_appt"
  | "bol_mismatch"
  | "carrier_dispute";
export type EvidenceType = "photo" | "audio" | "pdf" | "email";
export type DispositionCode =
  | "CARRIER_LIABILITY"
  | "REFUND_FULL"
  | "CREDIT_MEMO"
  | "WRITE_OFF"
  | "ESCALATE"
  | "REBOOK";

export type Customer = {
  id: string;
  name: string;
  ltv_band: LtvBand;
  sla_tier: SlaTier;
};

export type Exception = {
  id: string;
  status: ExceptionStatus;
  type: ExceptionType;
  carrier: string | null;
  lane: string | null;
  sku: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  exception_id: string;
  customer_id: string;
  asn_id: string | null;
  bol_number: string | null;
  po_number: string | null;
  quantity: number;
  unit_value_usd: number;
};

export type Evidence = {
  id: string;
  exception_id: string;
  type: EvidenceType;
  r2_key: string;
  label: string | null;
};

export type Decision = {
  id: string;
  exception_id: string;
  disposition_code: DispositionCode;
  confidence: number;
  dollar_impact: number;
  reasoning: string;
  created_at: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Seed data — three customers, seven inbox-anchored exceptions
// ─────────────────────────────────────────────────────────────────────────────

export const CUSTOMERS: Customer[] = [
  {
    id: "cust_001",
    name: "Bay Furniture Group",
    ltv_band: "platinum",
    sla_tier: "tier1",
  },
  {
    id: "cust_002",
    name: "Coastal Hospitality Supply",
    ltv_band: "gold",
    sla_tier: "tier2",
  },
  {
    id: "cust_003",
    name: "Northeast Contract Furnishings",
    ltv_band: "standard",
    sla_tier: "tier3",
  },
];

export const EXCEPTIONS: Exception[] = [
  {
    id: "ex_001",
    status: "open",
    type: "damaged_pallet",
    carrier: "Carrier Atlas",
    lane: "BOS->ATL",
    sku: "SKU-8831",
    created_at: "2026-05-26T09:14:00Z",
    updated_at: "2026-05-26T09:14:00Z",
  },
  {
    id: "ex_002",
    status: "open",
    type: "os_d_short",
    carrier: "Carrier Atlas",
    lane: "BOS->ATL",
    sku: "SKU-1120",
    created_at: "2026-05-24T14:08:00Z",
    updated_at: "2026-05-24T14:08:00Z",
  },
  {
    id: "ex_003",
    status: "open",
    type: "os_d_short",
    carrier: "Carrier Atlas",
    lane: "BOS->ATL",
    sku: "SKU-1120",
    created_at: "2026-05-24T16:32:00Z",
    updated_at: "2026-05-24T16:32:00Z",
  },
  {
    id: "ex_007",
    status: "open",
    type: "damaged_pallet",
    carrier: "Carrier Beacon",
    lane: "JAX->ORD",
    sku: "SKU-7822",
    created_at: "2026-05-22T15:41:00Z",
    updated_at: "2026-05-22T15:41:00Z",
  },
  {
    id: "ex_012",
    status: "open",
    type: "carrier_dispute",
    carrier: "Carrier Orion",
    lane: "BNA->CLT",
    sku: "SKU-2045",
    created_at: "2026-05-23T10:22:00Z",
    updated_at: "2026-05-23T10:22:00Z",
  },
  {
    id: "ex_018",
    status: "open",
    type: "bol_mismatch",
    carrier: "Carrier Orion",
    lane: "TUS->ABQ",
    sku: "SKU-8844",
    created_at: "2026-05-25T11:47:00Z",
    updated_at: "2026-05-25T11:47:00Z",
  },
  {
    id: "ex_023",
    status: "open",
    type: "missed_appt",
    carrier: "Carrier Orion",
    lane: "MCI->STL",
    sku: "SKU-6633",
    created_at: "2026-05-24T16:32:00Z",
    updated_at: "2026-05-26T08:00:00Z",
  },
];

export const ORDERS: Order[] = [
  {
    id: "ord_001",
    exception_id: "ex_001",
    customer_id: "cust_001",
    asn_id: "ASN-88451",
    bol_number: "BOL-ATL-88451-A",
    po_number: "BF-88451",
    quantity: 4,
    unit_value_usd: 1850,
  },
  {
    id: "ord_002",
    exception_id: "ex_002",
    customer_id: "cust_001",
    asn_id: "ASN-91102",
    bol_number: "BOL-ATL-91102",
    po_number: "BF-91102",
    quantity: 12,
    unit_value_usd: 96,
  },
  {
    id: "ord_003",
    exception_id: "ex_003",
    customer_id: "cust_003",
    asn_id: "ASN-71228",
    bol_number: "BOL-ATL-71228",
    po_number: "NCF-71228",
    quantity: 12,
    unit_value_usd: 96,
  },
  {
    id: "ord_007",
    exception_id: "ex_007",
    customer_id: "cust_003",
    asn_id: "ASN-44012",
    bol_number: "BOL-BEA-44012",
    po_number: "NCF-44012",
    quantity: 8,
    unit_value_usd: 0, // display-sample lot, salvage value $0
  },
  {
    id: "ord_012",
    exception_id: "ex_012",
    customer_id: "cust_002",
    asn_id: "ASN-58102",
    bol_number: "BOL-ORI-58102",
    po_number: "CH-58102",
    quantity: 1,
    unit_value_usd: 4200,
  },
  {
    id: "ord_018",
    exception_id: "ex_018",
    customer_id: "cust_003",
    asn_id: "ASN-22041",
    bol_number: "BOL-ORI-22041",
    po_number: "NCF-22041",
    quantity: 30,
    unit_value_usd: 38,
  },
  {
    id: "ord_023",
    exception_id: "ex_023",
    customer_id: "cust_003",
    asn_id: "ASN-77234",
    bol_number: "BOL-ORI-77234",
    po_number: "NCF-77234",
    quantity: 800,
    unit_value_usd: 4.25,
  },
];

export const EVIDENCE: Evidence[] = [
  // ex_001 — HERO-1 multimodal stack: photo + driver voicemail + BOL pdf
  {
    id: "ev_001",
    exception_id: "ex_001",
    type: "photo",
    r2_key: "ex_001_pallet_crush.jpg",
    label: "Pallet 2 of 2, corner-block crush",
  },
  {
    id: "ev_002",
    exception_id: "ex_001",
    type: "audio",
    r2_key: "ex_001_driver_fault.mp3",
    label: "Driver voicemail — 0:42",
  },
  {
    id: "ev_003",
    exception_id: "ex_001",
    type: "pdf",
    r2_key: "ex_001_bol.pdf",
    label: "BOL-ATL-88451-A signed exception",
  },
  {
    id: "ev_004",
    exception_id: "ex_001",
    type: "email",
    r2_key: "ex_001_inbound.eml",
    label: "Inbound from Sarah Bennett",
  },
  // ex_002 — short-ship, platinum (HERO-2a)
  {
    id: "ev_005",
    exception_id: "ex_002",
    type: "email",
    r2_key: "ex_002_inbound.eml",
    label: "Inbound from Mark Riley",
  },
  {
    id: "ev_006",
    exception_id: "ex_002",
    type: "pdf",
    r2_key: "ex_002_bol.pdf",
    label: "BOL-ATL-91102 receiving notation",
  },
  // ex_003 — short-ship, standard (HERO-2b)
  {
    id: "ev_007",
    exception_id: "ex_003",
    type: "email",
    r2_key: "ex_003_inbound.eml",
    label: "Inbound from Tom Bishop",
  },
  {
    id: "ev_008",
    exception_id: "ex_003",
    type: "pdf",
    r2_key: "ex_003_bol.pdf",
    label: "BOL-ATL-71228 receiving notation",
  },
  // ex_007 — HERO-3 photo + write-off context
  {
    id: "ev_009",
    exception_id: "ex_007",
    type: "photo",
    r2_key: "ex_007_water_damage.jpg",
    label: "Water-damaged showroom samples",
  },
  {
    id: "ev_010",
    exception_id: "ex_007",
    type: "email",
    r2_key: "ex_007_inbound.eml",
    label: "Inbound from Robert Kim",
  },
  // ex_012 — HERO-4 carrier dispute, low evidence
  {
    id: "ev_011",
    exception_id: "ex_012",
    type: "photo",
    r2_key: "ex_012_intact_but_short.jpg",
    label: "Intact-looking pallet (disputed)",
  },
  {
    id: "ev_012",
    exception_id: "ex_012",
    type: "email",
    r2_key: "ex_012_inbound.eml",
    label: "Inbound from Lisa Tran",
  },
  // ex_018 — bol_mismatch with AR-invoice evidence
  {
    id: "ev_013",
    exception_id: "ex_018",
    type: "pdf",
    r2_key: "ex_018_ar_invoice.pdf",
    label: "AR invoice — color-mismatch line item",
  },
  {
    id: "ev_014",
    exception_id: "ex_018",
    type: "email",
    r2_key: "ex_018_inbound.eml",
    label: "Inbound from David Chen",
  },
  // ex_023 — HERO-5 missed appt with driver audio
  {
    id: "ev_015",
    exception_id: "ex_023",
    type: "audio",
    r2_key: "ex_023_carrier_dispute.mp3",
    label: "Dispatcher voicemail — 1:08",
  },
  {
    id: "ev_016",
    exception_id: "ex_023",
    type: "email",
    r2_key: "ex_023_inbound.eml",
    label: "Inbound from Jenny Park",
  },
];

// decisions are populated by the worker runtime as the agent executes; the
// inbox surfaces them as a disposition badge when present.
export const DECISIONS: Decision[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// Inbox display layer — joins schema rows into the shape the inbox UI expects
// ─────────────────────────────────────────────────────────────────────────────

export type Severity = "Critical" | "High" | "Medium" | "Low";

export type Complaint = {
  id: string; // = exception.id
  exception: Exception;
  customer: Customer;
  order: Order;
  evidence: Evidence[];
  decision: Decision | null;
  from: { name: string; email: string; company: string; role: string };
  subject: string;
  receivedAt: string;
  severity: Severity;
  category: string; // humanized exception.type
  summary: string;
  body: string;
  poNumber?: string;
  draftSuggestions: string[];
};

type InboxContent = {
  exception_id: string;
  from: { name: string; email: string; role: string };
  subject: string;
  severity: Severity;
  summary: string;
  body: string;
  draftSuggestions: string[];
};

const INBOX_CONTENT: InboxContent[] = [
  {
    exception_id: "ex_001",
    from: {
      name: "Sarah Bennett",
      email: "sarah.bennett@bayfurniture.example",
      role: "VP Production",
    },
    subject:
      "Re: PO #BF-88451 — Sofa frames damaged on arrival (Carrier Atlas, BOS→ATL)",
    severity: "Critical",
    summary:
      "3 of 4 sofa frames (SKU-8831) on pallet 2 of 2 arrived with cracked corner blocks. Driver voicemail attached admits dock-clip on the Atlanta side. BOL-ATL-88451-A signed with exception. Platinum/Tier1 — Marriott Boston install hard date Friday — credit memo not acceptable.",
    body: `Hi team,

We received the four sofa frames from PO #BF-88451 this morning. Three of the four have visible damage to the corner blocks — looks like the pallet was crushed in transit. Photos attached, BOL-ATL-88451-A signed with the discrepancy noted, and your carrier's driver actually left us a voicemail admitting he clipped the dock at the ATL terminal.

We need replacements by Thursday EOD or this will hold up our Friday assembly. Please advise on the RMA process or whether you can expedite a replacement set.

We CAN'T accept credit memos at this stage — this is a contracted job for Marriott Boston with a hard install date.

Thanks,
Sarah Bennett
VP Production · Bay Furniture Group
+1 (617) 555-0182`,
    draftSuggestions: [
      "Tell Sarah we're pulling four replacement sofa frames off the Memphis DC rack tonight and hot-shotting them so they hit her dock Wednesday EOD, no charge — Marriott Friday install stays on the calendar.",
      "Apologize for the crushed pallet, attach the RMA form for the three damaged frames, and ask her to keep the broken units on-site until the Carrier Atlas inspector signs off Tuesday.",
      "Ask Sarah to send pallet and shrink-wrap photos plus the BOL-ATL-88451-A exception notation so we can open the carrier-liability claim against Atlas same day.",
    ],
  },
  {
    exception_id: "ex_002",
    from: {
      name: "Mark Riley",
      email: "mark.riley@bayfurniture.example",
      role: "Receiving Supervisor",
    },
    subject: "Short-ship on PO #BF-91102 — 1 carton SKU-1120 missing",
    severity: "High",
    summary:
      "BOL-ATL-91102 lists 12 cartons of SKU-1120 (MDF panels) shipped from Carrier Atlas BOS→ATL but only 11 arrived. Driver claims 12 loaded. Receiving signed for 11 with discrepancy. Platinum/Tier1 — policy is full refund plus expedited replacement on confirmed short.",
    body: `Hi,

The BOL for PO #BF-91102 lists 12 cartons of SKU-1120 (MDF-34-49x97 panels) on line 7, but only 11 cartons were on the truck when it arrived at our dock from Atlas's ATL terminal. The driver claims 12 were loaded at BOS.

Receiving signed for 11 and noted the discrepancy on BOL-ATL-91102.

Either way we are short one carton — please reconcile and ship the missing unit or short the invoice.

Mark Riley
Receiving Supervisor · Bay Furniture Group`,
    draftSuggestions: [
      "Tell Mark we'll ship a replacement carton of SKU-1120 from Memphis DC on our freight account same day, ETA Friday — Platinum policy is full make-good plus expedited delivery, no waiting on the carrier claim.",
      "Confirm we'll open an OS&D claim against Carrier Atlas using the signed BOL-ATL-91102 exception and ask their terminal manager to walk the BOS floor for the missing carton.",
      "Ask Mark to email the BOL photo with the discrepancy notation and the driver's name so we can pursue the missing carton with Atlas's terminal manager directly.",
    ],
  },
  {
    exception_id: "ex_003",
    from: {
      name: "Tom Bishop",
      email: "tom.bishop@necontract.example",
      role: "Receiving Supervisor",
    },
    subject:
      "Short ship — PO #NCF-71228, 1 carton SKU-1120 missing on BOL-ATL-71228",
    severity: "Medium",
    summary:
      "Same SKU-1120 short-ship as ex_002, but Standard/Tier3 customer. BOL lists 12 cartons, 11 arrived, no driver admission. Per policy this is a credit-memo case unless customer escalates.",
    body: `Hello,

Receiving signed for 11 of 12 cartons of SKU-1120 on PO #NCF-71228 today. BOL-ATL-71228 lists 12 cartons loaded at BOS. Driver had no comment.

Please either short the invoice by one carton or ship the missing piece — we can wait.

Tom Bishop
Receiving Supervisor · Northeast Contract Furnishings`,
    draftSuggestions: [
      "Tell Tom we'll short the invoice by one carton on PO #NCF-71228 today and issue a credit memo — Standard tier policy doesn't include an expedited make-good, but he can re-order at cost if he needs it now.",
      "Open an OS&D claim against Carrier Atlas using the signed BOL-ATL-71228 exception and let Tom know we'll update him once the carrier acknowledges.",
      "Confirm with Tom that we'll waive the freight on his next replacement carton order to make up for the short.",
    ],
  },
  {
    exception_id: "ex_007",
    from: {
      name: "Robert Kim",
      email: "robert.kim@necontract.example",
      role: "Showroom Lead",
    },
    subject:
      "PO #NCF-44012 — water-damaged showroom samples on JAX→ORD lane",
    severity: "Medium",
    summary:
      "Photo shows 8 units of SKU-7822 (display-sample edge banding) soaked through on Carrier Beacon JAX→ORD. Looks like total loss, BUT: order line is marked salvage-value $0 (showroom sample lot). No claim filed historically on $0-value goods.",
    body: `Hi,

The Carrier Beacon shipment for PO #NCF-44012 arrived this morning with all 8 SKU-7822 cartons soaked — looks like water got into the trailer somewhere between JAX and the ORD cross-dock. Photos attached.

These were our showroom display samples for the spring refresh — we already swapped to the next style, but I wanted to flag the damage for whatever your process is.

Robert Kim
Showroom Lead · Northeast Contract Furnishings`,
    draftSuggestions: [
      "Tell Robert we're writing off PO #NCF-44012 as no-claim per policy — line item was already flagged salvage-value $0 as showroom samples, so no carrier claim and no replacement is owed.",
      "Acknowledge the water damage on the Carrier Beacon JAX→ORD load and offer Robert a courtesy 5% credit on his next sample order even though the lot was zero-value.",
      "Ask Robert to discard the damaged cartons on-site, send us the disposal receipt for our audit log, and we'll close the exception with a write-off disposition.",
    ],
  },
  {
    exception_id: "ex_012",
    from: {
      name: "Lisa Tran",
      email: "lisa.tran@coastalhospitality.example",
      role: "Materials Engineer",
    },
    subject:
      "Carrier Orion disputing damage claim on PO #CH-58102 — escalation needed",
    severity: "High",
    summary:
      "Carrier Orion is disputing our damage claim on SKU-2045 (HR foam, $4,200 unit). Pallet photo shows intact shrink-wrap, but our QC says density is off-spec. Carrier says delivered as loaded. Evidence is ambiguous — recommend escalation to a human reviewer.",
    body: `Hello,

We pulled samples from the HR Polyurethane Foam delivery (PO #CH-58102, SKU-2045) and our QC lab is showing density of 2.4 lb/ft³ — your spec sheet lists 2.8 lb/ft³ as the floor for this SKU.

Carrier Orion's terminal in BNA pushed back on our damage notation, saying the pallet looked intact at delivery (photo attached, you can see it does). But the foam itself is out of spec for the Marriott 240-room hospitality contract which requires Cal 117-2013 plus the 2.8 density minimum.

We need you to:

  1. Quarantine the rest of lot HR-2845-T-W22 at your DC
  2. Send us a corrected test certificate
  3. Either confirm spec or issue replacement before Friday

Lisa Tran
Materials Engineer · Coastal Hospitality Supply`,
    draftSuggestions: [
      "Acknowledge the Cal 117-2013 plus 2.8 density floor for the Marriott contract and tell Lisa we're escalating the Carrier Orion dispute to Maria for human review — initial agent confidence was below threshold given the intact-pallet photo conflicts with the density failure.",
      "Confirm we've placed lot HR-2845-T-W22 on quarantine at the Memphis DC and will send a corrected COC plus ASTM D3574 retest by Thursday regardless of the carrier-liability outcome.",
      "Loop Lisa in with our foam vendor's QA lead and Carrier Orion's claims manager for a three-way call before Friday so the root cause and liability allocation are settled in one conversation.",
    ],
  },
  {
    exception_id: "ex_018",
    from: {
      name: "David Chen",
      email: "david.chen@necontract.example",
      role: "Procurement Lead",
    },
    subject:
      "BOL mismatch — PO #NCF-22041, SKU-8844 labeled correctly but wrong shade",
    severity: "Low",
    summary:
      "30 yards of SKU-8844 (PF-NAVY-54) arrived on Carrier Orion TUS→ABQ. Roll labeled correctly per BOL-ORI-22041, but the shade is noticeably darker than the approved March swatch. Third color drift this season — AR invoice attached shows the line item.",
    body: `Hello,

We ordered 30 yards of SKU-8844 (PF-NAVY-54, Performance Weave, Navy) on PO #NCF-22041. BOL-ORI-22041 from Carrier Orion lists the roll correctly, and the SKU label on the roll matches — but the color is noticeably darker and bluer than the swatch we approved.

This is the third time this season we've received a color mismatch on the contract line. AR invoice attached.

Cutting was scheduled for Tuesday morning and we now need to delay. Can you confirm whether this was a labeling issue or whether the wrong SKU was pulled? Either way we need correct material on-site by Monday.

David Chen
Procurement Lead · Northeast Contract Furnishings`,
    draftSuggestions: [
      "Confirm with David that SKU-8844 dye batch B drifted out of tolerance, offer to overnight 30 yards from the original March dye lot so cutting can run Monday morning — and route the AR-invoice correction through the claim.",
      "Acknowledge this is the third color miss this season, commit to a dedicated colorimeter QC hold on his next three contract orders, and waive freight on the replacement roll via Carrier Orion's expedited service.",
      "Apologize and ask David to ship the off-shade roll back COD on our account so the dye house can pull it for a full spectro retest before we issue the credit against the AR invoice.",
    ],
  },
  {
    exception_id: "ex_023",
    from: {
      name: "Jenny Park",
      email: "jenny.park@necontract.example",
      role: "Plant Manager",
    },
    subject:
      "Carrier Orion missed delivery appt — PO #NCF-77234, line stops Wed AM",
    severity: "High",
    summary:
      "800 units of SKU-6633 (casters) on Carrier Orion MCI→STL missed today's dock appointment. Dispatcher voicemail attached. Customer's assembly line stops Wednesday morning if these don't land. 2-hour reschedule window before next-available appt fills up.",
    body: `Team,

PO #NCF-77234 for 800 units of SKU-6633 was supposed to deliver this morning on Carrier Orion's MCI→STL lane. Their dispatcher just left us a voicemail (attached) saying the driver ran out of HOS and won't make today's appointment window.

Our assembly line for the task chair run stops Wednesday morning unless these casters land. Can someone in your logistics group reschedule with Orion before their next-available slot fills up? It's a 2-hour window.

At this point I'd rather you confirm they're booked for tomorrow than keep waiting.

Jenny Park
Plant Manager · Northeast Contract Furnishings`,
    draftSuggestions: [
      "Tell Jenny we just booked the Carrier Orion MCI→STL load for the 6:00am Wednesday appointment slot — driver swap is confirmed, ETA her dock 7:30am, well before her Wed AM line start.",
      "Confirm we'll dispatch a hot-shot of 200 units of SKU-6633 from the St. Louis cross-dock tonight to cover the first shift even if Orion slips again on the rebook.",
      "Offer Jenny a 10 percent credit on her next caster order for the appointment miss and loop in Orion's account manager so she's not chasing the PRO number herself.",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Derive the inbox Complaint[] by joining schema rows + curated content.
// ─────────────────────────────────────────────────────────────────────────────

const exceptionById = new Map(EXCEPTIONS.map((e) => [e.id, e]));
const orderByExceptionId = new Map(ORDERS.map((o) => [o.exception_id, o]));
const customerById = new Map(CUSTOMERS.map((c) => [c.id, c]));
const decisionByExceptionId = new Map(
  DECISIONS.map((d) => [d.exception_id, d]),
);
const evidenceByExceptionId = EVIDENCE.reduce<Map<string, Evidence[]>>(
  (acc, ev) => {
    const list = acc.get(ev.exception_id) ?? [];
    list.push(ev);
    acc.set(ev.exception_id, list);
    return acc;
  },
  new Map(),
);

export const COMPLAINTS: Complaint[] = INBOX_CONTENT.map((row) => {
  const exception = exceptionById.get(row.exception_id);
  const order = orderByExceptionId.get(row.exception_id);
  if (!exception || !order) {
    throw new Error(
      `Inbox row references missing exception/order: ${row.exception_id}`,
    );
  }
  const customer = customerById.get(order.customer_id);
  if (!customer) {
    throw new Error(
      `Order ${order.id} references missing customer: ${order.customer_id}`,
    );
  }
  return {
    id: exception.id,
    exception,
    customer,
    order,
    evidence: evidenceByExceptionId.get(exception.id) ?? [],
    decision: decisionByExceptionId.get(exception.id) ?? null,
    from: {
      name: row.from.name,
      email: row.from.email,
      company: customer.name,
      role: row.from.role,
    },
    subject: row.subject,
    receivedAt: exception.created_at,
    severity: row.severity,
    category: exceptionTypeLabel(exception.type),
    summary: row.summary,
    body: row.body,
    poNumber: order.po_number ?? undefined,
    draftSuggestions: row.draftSuggestions,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Display helpers
// ─────────────────────────────────────────────────────────────────────────────

export function formatReceivedAt(iso: string): string {
  const d = new Date(iso);
  const now = new Date("2026-05-26T12:00:00Z");
  const diffHr = Math.round((now.getTime() - d.getTime()) / 3_600_000);
  if (diffHr < 1) return "just now";
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function severityColor(s: Severity): string {
  switch (s) {
    case "Critical":
      return "bg-mc-red text-white";
    case "High":
      return "bg-orange-500 text-white";
    case "Medium":
      return "bg-mc-yellow text-black";
    case "Low":
      return "bg-mc-border text-mc-ink";
  }
}

export function exceptionTypeLabel(t: ExceptionType): string {
  switch (t) {
    case "damaged_pallet":
      return "Damaged Pallet";
    case "os_d_short":
      return "OS&D Short";
    case "missed_appt":
      return "Missed Appointment";
    case "bol_mismatch":
      return "BOL Mismatch";
    case "carrier_dispute":
      return "Carrier Dispute";
  }
}

export function ltvBandLabel(b: LtvBand): string {
  switch (b) {
    case "platinum":
      return "Platinum";
    case "gold":
      return "Gold";
    case "standard":
      return "Standard";
  }
}

// Maps the web schema exception ids to the worker's hero-case ids.
// Worker only knows about HERO-1..HERO-5 (with HERO-2 split into 2a/2b).
// Rows without a worker counterpart fall back to the placeholder /api/run.
const WORKER_EXCEPTION_MAP: Record<string, string> = {
  ex_001: "HERO-1",
  ex_002: "HERO-2a",
  ex_003: "HERO-2b",
  ex_007: "HERO-3",
  ex_012: "HERO-4",
  ex_023: "HERO-5",
};

export function workerExceptionId(exceptionId: string): string | null {
  return WORKER_EXCEPTION_MAP[exceptionId] ?? null;
}

export function evidenceTypeIcon(t: EvidenceType): string {
  switch (t) {
    case "photo":
      return "📷";
    case "audio":
      return "🎙";
    case "pdf":
      return "📄";
    case "email":
      return "✉";
  }
}
