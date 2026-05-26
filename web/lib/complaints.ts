export type Severity = "Critical" | "High" | "Medium" | "Low";

export type Complaint = {
  id: string;
  from: { name: string; email: string; company: string };
  subject: string;
  receivedAt: string;
  severity: Severity;
  category: string;
  summary: string;
  body: string;
  poNumber?: string;
  draftSuggestions: string[];
};

export const COMPLAINTS: Complaint[] = [
  {
    id: "ec-001",
    from: {
      name: "Sarah Bennett",
      email: "sarah.bennett@bayfurniture.example",
      company: "Bay Furniture Co.",
    },
    subject: "Re: PO #FD-88451 — Sofa frames damaged on arrival",
    receivedAt: "2026-05-25T09:14:00Z",
    severity: "Critical",
    category: "Damage Claim",
    poNumber: "FD-88451",
    summary:
      "3 of 4 sofa frames arrived with cracked corner blocks. Pallet appears crushed in transit. Customer needs replacements before Friday assembly for a Marriott contract — credit memo not acceptable.",
    body: `Hi team,

We received the four sofa frames from PO #FD-88451 this morning. Three of the four have visible damage to the corner blocks — looks like the pallet was crushed in transit. Photos attached.

We need replacements by Thursday EOD or this will hold up our Friday assembly. Please advise on the RMA process or whether you can expedite a replacement set.

We CAN'T accept credit memos at this stage — this is a contracted job for Marriott Boston with a hard install date.

Thanks,
Sarah Bennett
VP Production · Bay Furniture Co.
+1 (617) 555-0182`,
    draftSuggestions: [
      "Tell Sarah we're pulling four replacement sofa frames off the Memphis DC rack tonight and hot-shotting them so they hit her dock Wednesday EOD, no charge — Marriott Friday install stays on the calendar.",
      "Apologize for the crushed pallet, attach the RMA form for the three damaged frames, and ask her to keep the broken units on-site until the carrier inspector signs off Tuesday.",
      "Ask Sarah to send pallet and shrink-wrap photos plus the BOL exception notation so we can open the freight claim against the carrier same day.",
    ],
  },
  {
    id: "ec-002",
    from: {
      name: "David Chen",
      email: "david.chen@hartfordinteriors.example",
      company: "Hartford Interiors",
    },
    subject: "Wrong fabric SKU shipped — PO #HI-22041",
    receivedAt: "2026-05-25T11:47:00Z",
    severity: "High",
    category: "Wrong Item Shipped",
    poNumber: "HI-22041",
    summary:
      "30 yards labeled PF-NAVY-54 arrived in a noticeably darker shade than approved swatch. Third color mismatch this season. Cutting scheduled Tuesday — need correct material on-site by Monday.",
    body: `Hello,

We ordered 30 yards of PF-NAVY-54 (Performance Weave, Navy) on PO #HI-22041. The roll arrived today labeled correctly but the color is noticeably darker and bluer than the swatch we approved.

This is the third time this season we've received a color mismatch from your contract line.

Cutting was scheduled for Tuesday morning and we now need to delay. Can you confirm whether this was a labeling issue or whether the wrong SKU was pulled? Either way we need correct material on-site by Monday.

David Chen
Procurement Lead · Hartford Interiors`,
    draftSuggestions: [
      "Confirm with David that lot PF-NAVY-54 dye batch B drifted out of tolerance, offer to overnight 30 yards from the original March dye lot so cutting can run Monday morning.",
      "Acknowledge this is the third color miss this season, commit to a dedicated colorimeter QC hold on his next three contract orders, and waive freight on the replacement roll.",
      "Apologize and ask David to ship the off-shade roll back COD on our account so the dye house can pull it for a full spectro retest before we issue credit.",
    ],
  },
  {
    id: "ec-003",
    from: {
      name: "Jenny Park",
      email: "jpark@midwestofficepro.example",
      company: "MidWest Office Pro",
    },
    subject: "Casters delayed — production line stopping Wednesday",
    receivedAt: "2026-05-24T16:32:00Z",
    severity: "High",
    category: "Shipping / Carrier",
    poNumber: "MO-77234",
    summary:
      "800 units of CG-75PU-BK marked shipped 12 days ago, no carrier tracking updates. Customer's Steelcase-equivalent task chair line halts Wednesday AM. Wants to know whether to write off and re-order.",
    body: `Team,

PO #MO-77234 for 800 units of CG-75PU-BK was marked as "shipped" on 5/12 — twelve days ago — and we have no tracking updates in the portal. We've called the carrier twice with no answer.

Our assembly line for the Steelcase-equivalent task chair run stops Wednesday morning unless these casters land. Can someone in your logistics group pull the freight ticket and tell me where they are physically?

At this point I'd rather you confirm they're lost so we can re-order than keep waiting.

Jenny Park
Plant Manager · MidWest Office Pro`,
    draftSuggestions: [
      "Tell Jenny we tracked the freight to the Kansas City cross-dock, it's reloading tonight, ETA her dock Tuesday AM — we'll dispatch a hot-shot if it slips past 10am so her Wednesday line doesn't stop.",
      "Confirm we'll re-pull and ship 800 units of CG-75PU-BK from the Reno DC same day if she doesn't see tracking movement by 5pm Eastern, and bill the duplicate to our carrier claim.",
      "Offer Jenny a ten percent credit on her next caster order for the line-stop risk and loop in our carrier rep so she's not chasing the PRO number herself.",
    ],
  },
  {
    id: "ec-004",
    from: {
      name: "Mark Riley",
      email: "mriley@carolinacasegoods.example",
      company: "Carolina Casegoods",
    },
    subject: "BOL discrepancy — PO #CC-91102, line 7",
    receivedAt: "2026-05-24T14:08:00Z",
    severity: "Medium",
    category: "OS&D / Short Ship",
    poNumber: "CC-91102",
    summary:
      "BOL lists 12 cartons of MDF-34-49x97 on line 7 but only 11 arrived. Driver claims 12 loaded at CLT. Receiving signed for 11 and noted discrepancy. Need reconcile or short the invoice.",
    body: `Hi,

The BOL for PO #CC-91102 lists 12 cartons of MDF-34-49x97 on line 7, but only 11 cartons were on the truck when it arrived at our dock. The driver claims 12 were loaded at CLT.

Receiving signed for 11 and noted the discrepancy on the BOL.

Either way we are short one carton — please reconcile and ship the missing unit or short the invoice.

Mark Riley
Receiving Supervisor · Carolina Casegoods`,
    draftSuggestions: [
      "Tell Mark we'll short the invoice by one carton on PO CC-91102 today and open an OS&D claim with the carrier using the signed BOL exception — he doesn't need to do anything else on his end.",
      "Confirm we'll ship one replacement carton of MDF-34-49x97 out of CLT on our freight account, ETA his dock Friday, so his cut list isn't held up waiting on the claim outcome.",
      "Ask Mark to email the BOL photo with the discrepancy notation and the driver's name so we can pursue the missing carton with the carrier's terminal manager directly.",
    ],
  },
  {
    id: "ec-005",
    from: {
      name: "Lisa Tran",
      email: "ltran@coastalhospitality.example",
      company: "Coastal Hospitality Supply",
    },
    subject: "HR foam density off-spec on lot #HR-2845-T-W22",
    receivedAt: "2026-05-23T10:22:00Z",
    severity: "Medium",
    category: "Spec / Compliance",
    poNumber: "CH-58102",
    summary:
      "QC tested foam at 2.4 lb/ft³ vs. 2.8 spec floor. Marriott 240-room hospitality contract requires Cal 117 + 2.8 minimum. Needs DC quarantine on lot and corrected test cert by Friday.",
    body: `Hello,

We pulled samples from the HR Polyurethane Foam delivery (PO #CH-58102) and our QC lab is showing density of 2.4 lb/ft³ — your spec sheet lists 2.8 lb/ft³ as the floor for this SKU.

The hospitality contract (Marriott Hospitality, 240 rooms) requires Cal 117-2013 plus the 2.8 density minimum.

We need you to:

  1. Quarantine the rest of lot HR-2845-T-W22 at your DC
  2. Send us a corrected test certificate
  3. Either confirm spec or issue replacement before Friday

Lisa Tran
Materials Engineer · Coastal Hospitality Supply`,
    draftSuggestions: [
      "Confirm we've placed lot HR-2845-T-W22 on full quarantine at the Memphis DC, pulled a new lot that tested at 2.85 lb per cubic foot, and will overnight a corrected COC plus ASTM D3574 test sheet by Thursday.",
      "Acknowledge the Cal 117-2013 plus 2.8 density floor for the Marriott 240-room contract, commit to shipping a replacement skid no-charge, and reimburse her QC retest cost on submission of the lab invoice.",
      "Loop Lisa in with our foam vendor's QA lead for a three-way call before Friday so she gets the root-cause memo direct, not through procurement.",
    ],
  },
  {
    id: "ec-006",
    from: {
      name: "Robert Kim",
      email: "rkim@modernofficedesigns.example",
      company: "Modern Office Designs",
    },
    subject: "Edge banding color doesn't match approved sample",
    receivedAt: "2026-05-22T15:41:00Z",
    severity: "Low",
    category: "Quality / Cosmetic",
    poNumber: "MOD-44012",
    summary:
      "PVC-22-WAL-328 roll has visibly more red tint than swatch approved in March. End customer (law firm managing partner) noticed. Wants recipe-change heads-up policy.",
    body: `Hi,

We finished the executive suite job for Whitman & Sayre yesterday and the edge banding on the credenzas has a slightly more red tint than the swatch you approved with us in March.

The end customer (managing partner) noticed and pulled me aside. It's livable but not a match.

Can you confirm whether the recipe changed mid-year on this SKU? If so we'd like a heads-up next time so we can re-approve before committing to a job.

Robert Kim
Lead Installer · Modern Office Designs`,
    draftSuggestions: [
      "Confirm with Robert that the PVC-22-WAL-328 resin recipe changed in April, send him the new approved swatch card, and offer a fifteen percent credit on the Whitman & Sayre job for the tint drift.",
      "Apologize for not flagging the recipe change and commit to a thirty-day written notice policy on any color or formulation revision going forward — copy his procurement lead so it's on file.",
      "Offer Robert a fresh master swatch book on his next order, waive freight on a touch-up roll of the original April lot, and ship a sample of both lots side-by-side so the managing partner can sign off.",
    ],
  },
  {
    id: "ec-007",
    from: {
      name: "Anna Volkov",
      email: "avolkov@bostoncontract.example",
      company: "Boston Contract Furnishings",
    },
    subject: "HAZMAT shipment missing SDS — compliance blocker",
    receivedAt: "2026-05-22T08:55:00Z",
    severity: "Critical",
    category: "Compliance / HAZMAT",
    poNumber: "BCF-71228",
    summary:
      "4-pail lacquer order arrived with no SDS in packet. Safety officer rejected receipt per OSHA 1910.1200. OSHA inspector visit Thursday. Second occurrence this quarter.",
    body: `Your driver delivered four pails of LACQ-PC-CL-5G this morning with no SDS in the shipment packet.

Our safety officer rejected receipt — we can't put hazmat into the rack without SDS on file per OSHA 1910.1200.

We have a scheduled inspector visit Thursday. Either email the SDS now and I'll re-receive the goods, or arrange a pickup and re-ship with documentation.

This is the second time this quarter, by the way.

Anna Volkov
Safety Compliance Manager · Boston Contract Furnishings`,
    draftSuggestions: [
      "Email Anna the SDS for LACQ-PC-CL-5G right now from compliance@, confirm we'll attach physical SDS packets to every HAZMAT shipment going forward per OSHA 1910.1200, and ask her to re-receive once she has the doc.",
      "Acknowledge this is the second SDS miss this quarter, escalate to our HAZMAT compliance manager for a written CAPA, and offer a callback before her Thursday OSHA inspector visit.",
      "Offer to arrange driver pickup of the four lacquer pails and re-ship with the full documentation packet so she's not signing for non-compliant hazmat at all.",
    ],
  },
];

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
