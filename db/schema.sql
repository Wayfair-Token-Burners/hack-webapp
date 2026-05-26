PRAGMA foreign_keys = ON;

-- FreightDesk schema for Cloudflare D1 (SQLite)
-- Note: IDs use readable slugs for demo clarity (ex_001, ord_001, cust_001, ...)

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ltv_band TEXT NOT NULL CHECK (ltv_band IN ('platinum', 'gold', 'standard')),
  sla_tier TEXT NOT NULL CHECK (sla_tier IN ('tier1', 'tier2', 'tier3'))
);

CREATE TABLE IF NOT EXISTS exceptions (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'escalated')),
  type TEXT NOT NULL CHECK (type IN ('damaged_pallet', 'os_d_short', 'missed_appt', 'bol_mismatch', 'carrier_dispute')),
  carrier TEXT,
  lane TEXT,
  sku TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  exception_id TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  asn_id TEXT,
  bol_number TEXT,
  po_number TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_value_usd REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (exception_id) REFERENCES exceptions(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  exception_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'audio', 'pdf', 'email')),
  r2_key TEXT NOT NULL,
  label TEXT,
  FOREIGN KEY (exception_id) REFERENCES exceptions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS actions (
  id TEXT PRIMARY KEY,
  exception_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  sponsor TEXT,
  input_json TEXT,
  output_json TEXT,
  duration_ms INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (exception_id) REFERENCES exceptions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  exception_id TEXT NOT NULL UNIQUE,
  disposition_code TEXT NOT NULL CHECK (
    disposition_code IN (
      'CARRIER_LIABILITY',
      'REFUND_FULL',
      'CREDIT_MEMO',
      'WRITE_OFF',
      'ESCALATE',
      'REBOOK'
    )
  ),
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  dollar_impact REAL,
  reasoning TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (exception_id) REFERENCES exceptions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exceptions_status ON exceptions(status);
CREATE INDEX IF NOT EXISTS idx_exceptions_type ON exceptions(type);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_evidence_exception_id ON evidence(exception_id);
CREATE INDEX IF NOT EXISTS idx_actions_exception_id ON actions(exception_id);
