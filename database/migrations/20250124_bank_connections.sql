/**
 * =============================================================================
 * BANK CONNECTIONS - Database Migration for Setu Integration
 * =============================================================================
 * 
 * Creates tables to store bank account connections via Setu Account Aggregator
 * 
 * Run this migration:
 * psql -h YOUR_HOST -U postgres -d postgres -f 20250124_bank_connections.sql
 * =============================================================================
 */

-- =============================================================================
-- TABLE: bank_connections
-- Stores user's connected bank accounts via Account Aggregator
-- =============================================================================

CREATE TABLE IF NOT EXISTS bank_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Connection details
  provider VARCHAR(50) NOT NULL DEFAULT 'setu', -- 'setu', 'plaid', 'finbox'
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'revoked', 'error')),
  
  -- Setu specific
  consent_id TEXT,
  consent_handle TEXT,
  consent_status TEXT,
  consent_expiry TIMESTAMP WITH TIME ZONE,
  
  -- Account details
  account_link_ref TEXT,
  masked_account_number TEXT,
  account_type TEXT, -- 'SAVINGS', 'CURRENT', 'CREDIT_CARD', 'OVERDRAFT'
  fi_type TEXT, -- 'DEPOSIT', 'TERM-DEPOSIT', 'MUTUAL-FUNDS', etc.
  institution_name TEXT,
  
  -- Sync details
  last_synced_at TIMESTAMP WITH TIME ZONE,
  last_transaction_date DATE,
  sync_frequency_hours INTEGER DEFAULT 1,
  auto_sync_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, account_link_ref)
);

-- =============================================================================
-- TABLE: bank_sync_logs
-- Tracks sync history for monitoring and debugging
-- =============================================================================

CREATE TABLE IF NOT EXISTS bank_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES bank_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  sync_type VARCHAR(50) NOT NULL, -- 'manual', 'auto', 'initial'
  status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'partial'
  
  transactions_fetched INTEGER DEFAULT 0,
  transactions_imported INTEGER DEFAULT 0,
  transactions_skipped INTEGER DEFAULT 0,
  
  start_date DATE,
  end_date DATE,
  
  error_message TEXT,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_bank_connections_user_id ON bank_connections(user_id);
CREATE INDEX idx_bank_connections_status ON bank_connections(status) WHERE status = 'active';
CREATE INDEX idx_bank_connections_consent_id ON bank_connections(consent_id);
CREATE INDEX idx_bank_connections_account_link_ref ON bank_connections(account_link_ref);
CREATE INDEX idx_bank_connections_last_synced ON bank_connections(last_synced_at);
CREATE INDEX idx_bank_connections_provider ON bank_connections(provider);

CREATE INDEX idx_bank_sync_logs_connection_id ON bank_sync_logs(connection_id);
CREATE INDEX idx_bank_sync_logs_user_id ON bank_sync_logs(user_id);
CREATE INDEX idx_bank_sync_logs_created_at ON bank_sync_logs(created_at DESC);
CREATE INDEX idx_bank_sync_logs_status ON bank_sync_logs(status);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_sync_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own connections" ON bank_connections;
DROP POLICY IF EXISTS "Users can insert own connections" ON bank_connections;
DROP POLICY IF EXISTS "Users can update own connections" ON bank_connections;
DROP POLICY IF EXISTS "Users can delete own connections" ON bank_connections;
DROP POLICY IF EXISTS "Service role full access to connections" ON bank_connections;

DROP POLICY IF EXISTS "Users can view own sync logs" ON bank_sync_logs;
DROP POLICY IF EXISTS "Service role can insert sync logs" ON bank_sync_logs;

-- Bank connections policies
CREATE POLICY "Users can view own connections"
  ON bank_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON bank_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON bank_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON bank_connections FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to connections"
  ON bank_connections FOR ALL
  USING (true)
  WITH CHECK (true);

-- Sync logs policies
CREATE POLICY "Users can view own sync logs"
  ON bank_sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert sync logs"
  ON bank_sync_logs FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_bank_connection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_bank_connection_timestamp ON bank_connections;
CREATE TRIGGER trigger_update_bank_connection_timestamp
  BEFORE UPDATE ON bank_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_connection_updated_at();

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get active connections for user
CREATE OR REPLACE FUNCTION get_active_bank_connections(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  institution_name TEXT,
  masked_account_number TEXT,
  account_type TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bc.id,
    bc.institution_name,
    bc.masked_account_number,
    bc.account_type,
    bc.last_synced_at,
    bc.status
  FROM bank_connections bc
  WHERE bc.user_id = p_user_id
    AND bc.status IN ('active', 'pending')
  ORDER BY bc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get sync statistics
CREATE OR REPLACE FUNCTION get_bank_sync_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_syncs INTEGER,
  successful_syncs INTEGER,
  failed_syncs INTEGER,
  total_transactions_imported INTEGER,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  success_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_syncs,
    COUNT(*) FILTER (WHERE status = 'success')::INTEGER as successful_syncs,
    COUNT(*) FILTER (WHERE status = 'failed')::INTEGER as failed_syncs,
    COALESCE(SUM(transactions_imported), 0)::INTEGER as total_transactions_imported,
    MAX(created_at) as last_sync_at,
    CASE 
      WHEN COUNT(*) > 0 THEN ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2)
      ELSE 0
    END as success_rate
  FROM bank_sync_logs
  WHERE user_id = p_user_id
    AND created_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- GRANTS
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON bank_connections TO authenticated;
GRANT SELECT ON bank_sync_logs TO authenticated;
GRANT INSERT ON bank_sync_logs TO service_role;

GRANT EXECUTE ON FUNCTION get_active_bank_connections(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_bank_sync_stats(UUID, INTEGER) TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE bank_connections IS 
  'Stores user bank account connections via Account Aggregator (Setu)';

COMMENT ON TABLE bank_sync_logs IS 
  'Tracks sync history for bank connections - monitoring and debugging';

COMMENT ON COLUMN bank_connections.consent_id IS 
  'Setu consent request ID for tracking approval';

COMMENT ON COLUMN bank_connections.account_link_ref IS 
  'Unique reference from Account Aggregator for this linked account';

COMMENT ON COLUMN bank_connections.fi_type IS 
  'Financial Institution type: DEPOSIT, TERM-DEPOSIT, MUTUAL-FUNDS, etc.';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Bank Connections Migration Complete!';
  RAISE NOTICE 'Tables created: bank_connections, bank_sync_logs';
  RAISE NOTICE 'Indexes: 12 indexes for optimal performance';
  RAISE NOTICE 'Functions: 2 helper functions';
  RAISE NOTICE 'RLS policies: Enabled and configured';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Deploy Supabase Edge Functions';
  RAISE NOTICE '2. Set Supabase secrets (SETU_CLIENT_ID, SETU_CLIENT_SECRET)';
  RAISE NOTICE '3. Test with Setu sandbox';
END $$;

