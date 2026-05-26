# web/ — Frontend Dashboard partition

Owner during sprint: **Person C**. See root `README.md` for the full plan.

Will hold the Vite + React dashboard:

- `App.tsx` shell with `PersonaChip` ("Maria Chen · Exception Ops T2") and `MetricsBar`
- `QueuePage` — dense 40-row exception table, "Run all open" CTA
- `DetailPanel` — `EvidencePanel` (audio + photo + PDF + email) + `AgentTrace` (SSE) + `ResolutionCard` + `DraftMessages`

**Single architectural rule:** this partition NEVER calls Subconscious, Baseten, or D1 directly. All traffic goes through `worker/`. Keys stay server-side; the agent trace is one observable SSE stream rendered here.

Bootstrap (once Person C starts):
```bash
cd web
pnpm create vite@latest . --template react-ts
pnpm install
pnpm dev    # http://localhost:5173
```

## Voice input test prompts

Realistic floor-worker dictation samples for a furniture warehouse / storage context. Mixes warehouse jargon, abbreviations, and messy phrasing as you'd hear on a headset or walkie.

### Customer reply / complaint handling
1. "Draft a reply to Mrs. Patel — her sectional arrived with a gouge on the chaise arm, tell her we'll send a tech for touch-up or swap the piece, ETA two weeks on the swap."
2. "Write back to the customer on order 88142, the loveseat is back-ordered til mid-July, offer them the floor model at fifteen percent off or a full refund."
3. "Respond to the Yelp complaint about the recliner squeaking — apologize, ask for the SKU off the law tag, offer in-home service call."
4. "Email the customer that their white-glove delivery got bumped to Thursday because the LTL carrier missed the dock window, no charge for the reschedule."
5. "Reply to the Wayfair message — yes we have the buyer's-remorse return, RA number is pending, tell them pickup will be COD on the restocking fee."

### Inventory / locating
6. "Where's the reserve pallet for SKU 4471-OAK, the pick slot in aisle 12 is empty and I've got three on the pull list."
7. "Cycle count says nine ottomans in bay B-204 but I'm only seeing six on the rack, can you check if any went out on yesterday's BOL."
8. "Is the Brentwood KD bed frame in carton one of three or one of two — I've got a mixed pallet and the labels are torn."

### Damage / quality
9. "Reporting a blem on the Ashton dresser, top-left drawer face has a deep scuff, do I send it to the damage cage or call the vendor for a replacement panel."
10. "The whole inbound from Coaster has frame damage on the long boxes, looks like the freight got crushed — should I refuse the rest of the load or sign with exceptions."
11. "Customer return came in with a tear on the back cushion, not in the photos from the driver — do we eat it or charge back to the carrier."

### Coordination
12. "Tell the dock supervisor I need a forklift at door six, the sleeper sofa pallet is too heavy for the pallet jack."
13. "Ask Jorge if he pulled the gray microfiber sectional for the Henderson delivery or if it's still in the staging lane."
14. "Let routing know the Westchester drop needs a two-man crew, third-floor walkup, no elevator, customer was warned on the call."

### Vendor / freight
15. "Open a claim with the carrier — two recliners on PRO number 77-3321 came in with forklift punctures through the carton."
16. "Email the rep at Lane, the swatch book they sent is missing the new performance fabrics, we keep getting customer questions on the Mariner line."

### Supervisor / process
17. "Hey boss, the RTA assembly station is backed up, can I pull Marcus off receiving for an hour to help knock down the queue."
18. "Customer wants to walk the floor to see the sectional in person before they buy — are we still doing appointment-only or is walk-in okay now."
19. "I've got a COD refusal at the door, customer says NSF on the cashier's check — what do you want me to do with the load, send it back or restock."

### Incident / safety
20. "Reporting that the top rack in row 9 is leaning, the upright looks bent where a lift hit it, need to tag it out before we restock above shoulder height."
