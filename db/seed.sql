PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- Placeholder seed only.
-- Real freight narratives, dollar values, and evidence metadata will be injected later.

INSERT OR REPLACE INTO customers (id, name, ltv_band, sla_tier) VALUES
  ('cust_001', 'Placeholder Platinum Account', 'platinum', 'tier1'),
  ('cust_002', 'Placeholder Gold Account', 'gold', 'tier2'),
  ('cust_003', 'Placeholder Standard Account', 'standard', 'tier3');

INSERT OR REPLACE INTO exceptions (id, status, type, carrier, lane, sku, created_at, updated_at) VALUES
  ('ex_001', 'open', 'damaged_pallet', 'Carrier Atlas', 'BOS->ATL', 'SKU-8831', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_002', 'open', 'os_d_short', 'Carrier Atlas', 'BOS->ATL', 'SKU-1120', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_003', 'open', 'os_d_short', 'Carrier Atlas', 'BOS->ATL', 'SKU-1120', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_004', 'open', 'bol_mismatch', 'Carrier Nova', 'DAL->PHX', 'SKU-2204', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_005', 'open', 'missed_appt', 'Carrier Nova', 'MEM->MIA', 'SKU-4508', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_006', 'open', 'carrier_dispute', 'Carrier Horizon', 'LAX->SEA', 'SKU-3311', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_007', 'open', 'damaged_pallet', 'Carrier Beacon', 'JAX->ORD', 'SKU-7822', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_008', 'open', 'os_d_short', 'Carrier Beacon', 'DEN->PDX', 'SKU-6610', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_009', 'open', 'bol_mismatch', 'Carrier Atlas', 'ATL->RDU', 'SKU-9902', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_010', 'open', 'missed_appt', 'Carrier Horizon', 'SLC->SFO', 'SKU-5533', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_011', 'open', 'carrier_dispute', 'Carrier Nova', 'CLE->BUF', 'SKU-1188', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_012', 'open', 'carrier_dispute', 'Carrier Orion', 'BNA->CLT', 'SKU-2045', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_013', 'open', 'damaged_pallet', 'Carrier Orion', 'HOU->DFW', 'SKU-7741', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_014', 'open', 'os_d_short', 'Carrier Beacon', 'MSP->OMA', 'SKU-6080', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_015', 'open', 'bol_mismatch', 'Carrier Atlas', 'IND->DET', 'SKU-2477', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_016', 'open', 'missed_appt', 'Carrier Nova', 'PHL->RIC', 'SKU-3366', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_017', 'open', 'carrier_dispute', 'Carrier Horizon', 'STL->KC', 'SKU-5199', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_018', 'open', 'bol_mismatch', 'Carrier Orion', 'TUS->ABQ', 'SKU-8844', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_019', 'open', 'damaged_pallet', 'Carrier Atlas', 'ELP->SAT', 'SKU-4109', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_020', 'open', 'os_d_short', 'Carrier Beacon', 'PIT->CMH', 'SKU-6280', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_021', 'open', 'missed_appt', 'Carrier Nova', 'ORF->RDU', 'SKU-7315', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_022', 'open', 'carrier_dispute', 'Carrier Horizon', 'SAV->TPA', 'SKU-1544', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_023', 'open', 'missed_appt', 'Carrier Orion', 'MCI->STL', 'SKU-6633', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_024', 'open', 'bol_mismatch', 'Carrier Atlas', 'MAD->NASH', 'SKU-4461', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_025', 'open', 'damaged_pallet', 'Carrier Beacon', 'FAR->MSP', 'SKU-2500', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_026', 'open', 'os_d_short', 'Carrier Nova', 'BIL->SLC', 'SKU-9980', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_027', 'open', 'missed_appt', 'Carrier Horizon', 'TUL->OKC', 'SKU-1077', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_028', 'open', 'carrier_dispute', 'Carrier Orion', 'FLL->MCO', 'SKU-3008', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_029', 'open', 'bol_mismatch', 'Carrier Atlas', 'SPO->BOI', 'SKU-5580', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_030', 'open', 'damaged_pallet', 'Carrier Beacon', 'RNO->SJC', 'SKU-6001', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_031', 'open', 'os_d_short', 'Carrier Nova', 'LIT->MEM', 'SKU-8322', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_032', 'open', 'missed_appt', 'Carrier Horizon', 'CVG->SDF', 'SKU-4723', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_033', 'open', 'carrier_dispute', 'Carrier Orion', 'ALB->SYR', 'SKU-2888', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_034', 'open', 'bol_mismatch', 'Carrier Atlas', 'ROC->BUF', 'SKU-4512', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_035', 'open', 'damaged_pallet', 'Carrier Beacon', 'BWI->EWR', 'SKU-9001', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_036', 'open', 'os_d_short', 'Carrier Nova', 'RDU->CLT', 'SKU-2901', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_037', 'open', 'missed_appt', 'Carrier Horizon', 'SJC->LAX', 'SKU-7730', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_038', 'open', 'carrier_dispute', 'Carrier Orion', 'SNA->LAS', 'SKU-3820', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_039', 'open', 'bol_mismatch', 'Carrier Atlas', 'AUS->DAL', 'SKU-6609', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z'),
  ('ex_040', 'open', 'damaged_pallet', 'Carrier Beacon', 'MKE->CHI', 'SKU-5511', '2026-05-26T17:45:00Z', '2026-05-26T17:45:00Z');

INSERT OR REPLACE INTO orders (id, exception_id, customer_id, asn_id, bol_number, po_number, quantity, unit_value_usd) VALUES
  ('ord_001', 'ex_001', 'cust_001', 'asn_001', 'TODO-BOL-001', 'TODO-PO-001', 1, 0),
  ('ord_002', 'ex_002', 'cust_001', 'asn_002', 'TODO-BOL-002', 'TODO-PO-002', 1, 0),
  ('ord_003', 'ex_003', 'cust_003', 'asn_003', 'TODO-BOL-003', 'TODO-PO-003', 1, 0),
  ('ord_004', 'ex_004', 'cust_002', 'asn_004', 'TODO-BOL-004', 'TODO-PO-004', 1, 0),
  ('ord_005', 'ex_005', 'cust_003', 'asn_005', 'TODO-BOL-005', 'TODO-PO-005', 1, 0),
  ('ord_006', 'ex_006', 'cust_002', 'asn_006', 'TODO-BOL-006', 'TODO-PO-006', 1, 0),
  ('ord_007', 'ex_007', 'cust_003', 'asn_007', 'TODO-BOL-007', 'TODO-PO-007', 1, 0),
  ('ord_008', 'ex_008', 'cust_002', 'asn_008', 'TODO-BOL-008', 'TODO-PO-008', 1, 0),
  ('ord_009', 'ex_009', 'cust_003', 'asn_009', 'TODO-BOL-009', 'TODO-PO-009', 1, 0),
  ('ord_010', 'ex_010', 'cust_002', 'asn_010', 'TODO-BOL-010', 'TODO-PO-010', 1, 0),
  ('ord_011', 'ex_011', 'cust_003', 'asn_011', 'TODO-BOL-011', 'TODO-PO-011', 1, 0),
  ('ord_012', 'ex_012', 'cust_002', 'asn_012', 'TODO-BOL-012', 'TODO-PO-012', 1, 0),
  ('ord_013', 'ex_013', 'cust_001', 'asn_013', 'TODO-BOL-013', 'TODO-PO-013', 1, 0),
  ('ord_014', 'ex_014', 'cust_003', 'asn_014', 'TODO-BOL-014', 'TODO-PO-014', 1, 0),
  ('ord_015', 'ex_015', 'cust_002', 'asn_015', 'TODO-BOL-015', 'TODO-PO-015', 1, 0),
  ('ord_016', 'ex_016', 'cust_003', 'asn_016', 'TODO-BOL-016', 'TODO-PO-016', 1, 0),
  ('ord_017', 'ex_017', 'cust_002', 'asn_017', 'TODO-BOL-017', 'TODO-PO-017', 1, 0),
  ('ord_018', 'ex_018', 'cust_003', 'asn_018', 'TODO-BOL-018', 'TODO-PO-018', 1, 0),
  ('ord_019', 'ex_019', 'cust_001', 'asn_019', 'TODO-BOL-019', 'TODO-PO-019', 1, 0),
  ('ord_020', 'ex_020', 'cust_002', 'asn_020', 'TODO-BOL-020', 'TODO-PO-020', 1, 0),
  ('ord_021', 'ex_021', 'cust_003', 'asn_021', 'TODO-BOL-021', 'TODO-PO-021', 1, 0),
  ('ord_022', 'ex_022', 'cust_002', 'asn_022', 'TODO-BOL-022', 'TODO-PO-022', 1, 0),
  ('ord_023', 'ex_023', 'cust_003', 'asn_023', 'TODO-BOL-023', 'TODO-PO-023', 1, 0),
  ('ord_024', 'ex_024', 'cust_002', 'asn_024', 'TODO-BOL-024', 'TODO-PO-024', 1, 0),
  ('ord_025', 'ex_025', 'cust_001', 'asn_025', 'TODO-BOL-025', 'TODO-PO-025', 1, 0),
  ('ord_026', 'ex_026', 'cust_003', 'asn_026', 'TODO-BOL-026', 'TODO-PO-026', 1, 0),
  ('ord_027', 'ex_027', 'cust_002', 'asn_027', 'TODO-BOL-027', 'TODO-PO-027', 1, 0),
  ('ord_028', 'ex_028', 'cust_003', 'asn_028', 'TODO-BOL-028', 'TODO-PO-028', 1, 0),
  ('ord_029', 'ex_029', 'cust_002', 'asn_029', 'TODO-BOL-029', 'TODO-PO-029', 1, 0),
  ('ord_030', 'ex_030', 'cust_001', 'asn_030', 'TODO-BOL-030', 'TODO-PO-030', 1, 0),
  ('ord_031', 'ex_031', 'cust_003', 'asn_031', 'TODO-BOL-031', 'TODO-PO-031', 1, 0),
  ('ord_032', 'ex_032', 'cust_002', 'asn_032', 'TODO-BOL-032', 'TODO-PO-032', 1, 0),
  ('ord_033', 'ex_033', 'cust_003', 'asn_033', 'TODO-BOL-033', 'TODO-PO-033', 1, 0),
  ('ord_034', 'ex_034', 'cust_002', 'asn_034', 'TODO-BOL-034', 'TODO-PO-034', 1, 0),
  ('ord_035', 'ex_035', 'cust_001', 'asn_035', 'TODO-BOL-035', 'TODO-PO-035', 1, 0),
  ('ord_036', 'ex_036', 'cust_003', 'asn_036', 'TODO-BOL-036', 'TODO-PO-036', 1, 0),
  ('ord_037', 'ex_037', 'cust_002', 'asn_037', 'TODO-BOL-037', 'TODO-PO-037', 1, 0),
  ('ord_038', 'ex_038', 'cust_003', 'asn_038', 'TODO-BOL-038', 'TODO-PO-038', 1, 0),
  ('ord_039', 'ex_039', 'cust_002', 'asn_039', 'TODO-BOL-039', 'TODO-PO-039', 1, 0),
  ('ord_040', 'ex_040', 'cust_001', 'asn_040', 'TODO-BOL-040', 'TODO-PO-040', 1, 0);

INSERT OR REPLACE INTO evidence (id, exception_id, type, r2_key, label) VALUES
  ('ev_001', 'ex_001', 'photo', 'ex_001_pallet_crush.jpg', 'TODO: hero-1 damage photo'),
  ('ev_002', 'ex_001', 'audio', 'ex_001_driver_fault.mp3', 'TODO: hero-1 driver voicemail'),
  ('ev_003', 'ex_001', 'pdf', 'ex_001_bol.pdf', 'TODO: hero-1 BOL document'),
  ('ev_004', 'ex_007', 'photo', 'ex_007_water_damage.jpg', 'TODO: hero-3 water damage photo'),
  ('ev_005', 'ex_012', 'photo', 'ex_012_intact_but_short.jpg', 'TODO: hero-4 intact-but-short photo'),
  ('ev_006', 'ex_023', 'audio', 'ex_023_carrier_dispute.mp3', 'TODO: hero-5 carrier dispute voicemail'),
  ('ev_007', 'ex_018', 'pdf', 'ex_018_ar_invoice.pdf', 'TODO: AR invoice sample');

-- Bulk placeholder expansion: ex_041 -> ex_200
WITH RECURSIVE seq(n) AS (
  SELECT 41
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 200
)
INSERT OR REPLACE INTO exceptions (id, status, type, carrier, lane, sku, created_at, updated_at)
SELECT
  printf('ex_%03d', n),
  'open',
  CASE (n % 5)
    WHEN 0 THEN 'damaged_pallet'
    WHEN 1 THEN 'os_d_short'
    WHEN 2 THEN 'missed_appt'
    WHEN 3 THEN 'bol_mismatch'
    ELSE 'carrier_dispute'
  END,
  CASE (n % 4)
    WHEN 0 THEN 'Carrier Atlas'
    WHEN 1 THEN 'Carrier Beacon'
    WHEN 2 THEN 'Carrier Nova'
    ELSE 'Carrier Horizon'
  END,
  printf('LANE-%03d->%03d', n, n + 1),
  printf('SKU-%04d', 7000 + n),
  '2026-05-26T17:45:00Z',
  '2026-05-26T17:45:00Z'
FROM seq;

WITH RECURSIVE seq(n) AS (
  SELECT 41
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 200
)
INSERT OR REPLACE INTO orders (id, exception_id, customer_id, asn_id, bol_number, po_number, quantity, unit_value_usd)
SELECT
  printf('ord_%03d', n),
  printf('ex_%03d', n),
  CASE (n % 3)
    WHEN 0 THEN 'cust_001'
    WHEN 1 THEN 'cust_002'
    ELSE 'cust_003'
  END,
  printf('asn_%03d', n),
  printf('TODO-BOL-%03d', n),
  printf('TODO-PO-%03d', n),
  1 + (n % 3),
  0
FROM seq;

WITH RECURSIVE seq(n) AS (
  SELECT 41
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 200
)
INSERT OR REPLACE INTO evidence (id, exception_id, type, r2_key, label)
SELECT
  printf('ev_%03d', n - 33),
  printf('ex_%03d', n),
  CASE (n % 4)
    WHEN 0 THEN 'photo'
    WHEN 1 THEN 'audio'
    WHEN 2 THEN 'pdf'
    ELSE 'email'
  END,
  CASE (n % 4)
    WHEN 0 THEN printf('placeholder_ex_%03d_photo.jpg', n)
    WHEN 1 THEN printf('placeholder_ex_%03d_audio.mp3', n)
    WHEN 2 THEN printf('placeholder_ex_%03d_doc.pdf', n)
    ELSE printf('placeholder_ex_%03d_email.txt', n)
  END,
  printf('TODO: generated placeholder evidence for ex_%03d', n)
FROM seq;

-- Intentionally no inserts for actions/decisions.
-- These tables are populated by the worker runtime as the agent executes.

COMMIT;
