CREATE TABLE IF NOT EXISTS market_orders (
  id UUID PRIMARY KEY,
  order_type TEXT NOT NULL,
  market_type TEXT NOT NULL,
  status TEXT NOT NULL,
  seller_player_id UUID NULL,
  buyer_player_id UUID NULL,
  target_player_id UUID NULL,
  alliance_id TEXT NULL,
  resource_type TEXT NOT NULL,
  unit_price BIGINT NOT NULL,
  total_quantity BIGINT NOT NULL,
  remaining_quantity BIGINT NOT NULL,
  reserved_credits BIGINT NOT NULL DEFAULT 0,
  reserved_resources BIGINT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  expires_at BIGINT NULL,
  filled_at BIGINT NULL,
  cancelled_at BIGINT NULL,
  source_building_level INT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_market_orders_book ON market_orders (market_type, alliance_id, resource_type, status, unit_price, created_at);
CREATE INDEX IF NOT EXISTS idx_market_orders_owner ON market_orders (seller_player_id, buyer_player_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS market_trades (
  id UUID PRIMARY KEY,
  order_buy_id UUID NOT NULL,
  order_sell_id UUID NOT NULL,
  buyer_player_id UUID NOT NULL,
  seller_player_id UUID NOT NULL,
  market_type TEXT NOT NULL,
  alliance_id TEXT NULL,
  resource_type TEXT NOT NULL,
  quantity BIGINT NOT NULL,
  unit_price BIGINT NOT NULL,
  total_price BIGINT NOT NULL,
  tax_amount BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_market_trades_market ON market_trades (market_type, alliance_id, resource_type, created_at DESC);

CREATE TABLE IF NOT EXISTS market_wallets (
  player_id UUID PRIMARY KEY,
  orbital_credits_balance BIGINT NOT NULL DEFAULT 0,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS market_price_snapshots (
  id BIGSERIAL PRIMARY KEY,
  resource_type TEXT NOT NULL,
  market_type TEXT NOT NULL DEFAULT 'public',
  alliance_id TEXT NULL,
  bucket_start_at BIGINT NOT NULL,
  open_price BIGINT NOT NULL,
  high_price BIGINT NOT NULL,
  low_price BIGINT NOT NULL,
  close_price BIGINT NOT NULL,
  traded_volume BIGINT NOT NULL DEFAULT 0,
  trade_count BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_market_price_snapshots_market ON market_price_snapshots (market_type, alliance_id, resource_type, bucket_start_at DESC);

CREATE TABLE IF NOT EXISTS market_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_state JSONB NULL,
  after_state JSONB NULL,
  risk_score INT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS market_alerts (
  id UUID PRIMARY KEY,
  player_id UUID NOT NULL,
  resource_type TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  target_price BIGINT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS player_market_stats (
  player_id UUID PRIMARY KEY,
  total_bought BIGINT NOT NULL DEFAULT 0,
  total_sold BIGINT NOT NULL DEFAULT 0,
  total_fees_paid BIGINT NOT NULL DEFAULT 0,
  total_profit_estimate BIGINT NOT NULL DEFAULT 0,
  updated_at BIGINT NOT NULL
);
