/**
 * =============================================================================
 * GMAIL INTEGRATION DATABASE MIGRATION
 * =============================================================================
 * 
 * This migration creates the necessary database structures for Gmail integration
 * including user integration settings, email import tracking, and indexes.
 * 
 * Run this migration:
 * ```bash
 * psql -h YOUR_HOST -U postgres -d postgres -f 20250124_gmail_integration.sql
 * ```
 * 
 * Or via Supabase CLI:
 * ```bash
 * supabase db push
 * ```
 * =============================================================================
 */

-- =============================================================================
-- TABLE: user_integrations
-- Stores user's third-party integration settings (Gmail, Plaid, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Gmail Integration
  gmail_enabled BOOLEAN DEFAULT false,
  gmail_email TEXT,
  gmail_access_token TEXT,
  gmail_refresh_token TEXT,
  gmail_token_expiry TIMESTAMP WITH TIME ZONE,
  gmail_history_id TEXT, -- For incremental sync
  gmail_last_sync_at TIMESTAMP WITH TIME ZONE,
  gmail_watch_expiry TIMESTAMP WITH TIME ZONE,
  
  -- Future: Other integrations
  plaid_enabled BOOLEAN DEFAULT false,
  plaid_access_token TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id)
);

-- =============================================================================
-- TABLE: email_import_logs
-- Track email import history for debugging and analytics
-- =============================================================================

CREATE TABLE IF NOT EXISTS email_import_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email details
  email_id TEXT NOT NULL, -- Gmail message ID
  email_subject TEXT,
  email_from TEXT,
  email_date TIMESTAMP WITH TIME ZONE,
  
  -- Import status
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped', 'duplicate')),
  error_message TEXT,
  
  -- Transaction reference (if imported)
  transaction_id UUID REFERENCES transactions_real(id) ON DELETE SET NULL,
  
  -- Parsed data
  parsed_amount DECIMAL(12, 2),
  parsed_type TEXT,
  parsed_category TEXT,
  parsed_merchant TEXT,
  
  -- Metadata
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, email_id)
);

-- =============================================================================
-- INDEXES
-- Optimize queries for user integrations and email logs
-- =============================================================================

-- User integrations indexes
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id 
  ON user_integrations(user_id);

CREATE INDEX IF NOT EXISTS idx_user_integrations_gmail_email 
  ON user_integrations(gmail_email) 
  WHERE gmail_enabled = true;

CREATE INDEX IF NOT EXISTS idx_user_integrations_gmail_enabled 
  ON user_integrations(gmail_enabled) 
  WHERE gmail_enabled = true;

-- Email import logs indexes
CREATE INDEX IF NOT EXISTS idx_email_import_logs_user_id 
  ON email_import_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_email_import_logs_email_id 
  ON email_import_logs(email_id);

CREATE INDEX IF NOT EXISTS idx_email_import_logs_status 
  ON email_import_logs(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_import_logs_transaction_id 
  ON email_import_logs(transaction_id) 
  WHERE transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_import_logs_created_at 
  ON email_import_logs(created_at DESC);

-- =============================================================================
-- TRANSACTIONS TABLE: Update for email metadata
-- Add metadata column if it doesn't exist
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions_real' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE transactions_real ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add index for email_id lookups (duplicate detection)
CREATE INDEX IF NOT EXISTS idx_transactions_real_email_id 
  ON transactions_real((metadata->>'email_id')) 
  WHERE metadata->>'email_id' IS NOT NULL;

-- Add index for source lookups (analytics)
CREATE INDEX IF NOT EXISTS idx_transactions_real_source 
  ON transactions_real((metadata->>'source'));

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure users can only access their own integration data
-- =============================================================================

-- Enable RLS on user_integrations
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own integrations" ON user_integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON user_integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON user_integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON user_integrations;

-- Create policies
CREATE POLICY "Users can view own integrations"
  ON user_integrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON user_integrations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON user_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON user_integrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on email_import_logs
ALTER TABLE email_import_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own email logs" ON email_import_logs;
DROP POLICY IF EXISTS "Service role can insert email logs" ON email_import_logs;

-- Create policies
CREATE POLICY "Users can view own email logs"
  ON email_import_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role (Edge Functions) to insert logs
CREATE POLICY "Service role can insert email logs"
  ON email_import_logs
  FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- TRIGGERS
-- Auto-update timestamps
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_integrations
DROP TRIGGER IF EXISTS update_user_integrations_updated_at ON user_integrations;
CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- HELPER FUNCTIONS
-- Utility functions for Gmail integration
-- =============================================================================

-- Function: Get user's Gmail integration settings
CREATE OR REPLACE FUNCTION get_user_gmail_settings(p_user_id UUID)
RETURNS TABLE (
  gmail_enabled BOOLEAN,
  gmail_email TEXT,
  gmail_last_sync_at TIMESTAMP WITH TIME ZONE,
  total_imports INTEGER,
  successful_imports INTEGER,
  failed_imports INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ui.gmail_enabled,
    ui.gmail_email,
    ui.gmail_last_sync_at,
    COUNT(eil.id)::INTEGER as total_imports,
    COUNT(eil.id) FILTER (WHERE eil.status = 'success')::INTEGER as successful_imports,
    COUNT(eil.id) FILTER (WHERE eil.status = 'failed')::INTEGER as failed_imports
  FROM user_integrations ui
  LEFT JOIN email_import_logs eil ON ui.user_id = eil.user_id
  WHERE ui.user_id = p_user_id
  GROUP BY ui.gmail_enabled, ui.gmail_email, ui.gmail_last_sync_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get recent email imports for user
CREATE OR REPLACE FUNCTION get_recent_email_imports(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  email_subject TEXT,
  email_from TEXT,
  email_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  transaction_id UUID,
  parsed_amount DECIMAL,
  parsed_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eil.email_subject,
    eil.email_from,
    eil.email_date,
    eil.status,
    eil.transaction_id,
    eil.parsed_amount,
    eil.parsed_category,
    eil.created_at
  FROM email_import_logs eil
  WHERE eil.user_id = p_user_id
  ORDER BY eil.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get email import statistics
CREATE OR REPLACE FUNCTION get_email_import_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_emails INTEGER,
  successful_imports INTEGER,
  failed_imports INTEGER,
  duplicate_emails INTEGER,
  skipped_emails INTEGER,
  total_amount_imported DECIMAL,
  avg_processing_time_ms DECIMAL,
  most_common_bank TEXT,
  import_success_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'success') as success,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      COUNT(*) FILTER (WHERE status = 'duplicate') as duplicate,
      COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
      SUM(parsed_amount) FILTER (WHERE status = 'success') as total_amount,
      AVG(processing_time_ms) as avg_time,
      MODE() WITHIN GROUP (ORDER BY email_from) as common_bank
    FROM email_import_logs
    WHERE user_id = p_user_id
      AND created_at > NOW() - (p_days || ' days')::INTERVAL
  )
  SELECT 
    total::INTEGER,
    success::INTEGER,
    failed::INTEGER,
    duplicate::INTEGER,
    skipped::INTEGER,
    COALESCE(total_amount, 0),
    COALESCE(avg_time, 0),
    common_bank,
    CASE 
      WHEN total > 0 THEN ROUND(100.0 * success / total, 2)
      ELSE 0
    END as success_rate
  FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- GRANTS
-- Grant necessary permissions to authenticated users
-- =============================================================================

-- Grant access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON user_integrations TO authenticated;
GRANT SELECT ON email_import_logs TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_gmail_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_email_imports(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_email_import_stats(UUID, INTEGER) TO authenticated;

-- =============================================================================
-- COMMENTS
-- Add documentation to database objects
-- =============================================================================

COMMENT ON TABLE user_integrations IS 
  'Stores user third-party integration settings including Gmail OAuth tokens';

COMMENT ON TABLE email_import_logs IS 
  'Tracks email import history for debugging and analytics';

COMMENT ON COLUMN user_integrations.gmail_history_id IS 
  'Gmail history ID for incremental sync to avoid re-processing old emails';

COMMENT ON COLUMN user_integrations.gmail_watch_expiry IS 
  'Gmail watch expiration time - watch needs to be renewed before this';

COMMENT ON FUNCTION get_user_gmail_settings IS 
  'Retrieves Gmail integration settings and statistics for a user';

COMMENT ON FUNCTION get_recent_email_imports IS 
  'Returns recent email import logs for a user';

COMMENT ON FUNCTION get_email_import_stats IS 
  'Calculates email import statistics over a specified time period';

-- =============================================================================
-- SAMPLE DATA (for testing)
-- Uncomment to insert test data
-- =============================================================================

/*
-- Insert sample user integration (replace with actual user_id)
INSERT INTO user_integrations (user_id, gmail_enabled, gmail_email)
VALUES (
  'YOUR_USER_ID_HERE'::UUID,
  false,
  'user@example.com'
);

-- Insert sample email import log
INSERT INTO email_import_logs (
  user_id, 
  email_id, 
  email_subject, 
  email_from,
  email_date,
  status,
  parsed_amount,
  parsed_type,
  parsed_category,
  parsed_merchant,
  processing_time_ms
)
VALUES (
  'YOUR_USER_ID_HERE'::UUID,
  'test-message-id-123',
  'Your account has been debited with Rs.500.00',
  'alerts@hdfcbank.com',
  NOW(),
  'success',
  500.00,
  'expense',
  'Shopping',
  'Amazon',
  150
);
*/

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE '✅ Gmail Integration Migration Complete!';
  RAISE NOTICE 'Tables created: user_integrations, email_import_logs';
  RAISE NOTICE 'Indexes created: 9 indexes for optimal performance';
  RAISE NOTICE 'Functions created: 3 helper functions';
  RAISE NOTICE 'RLS policies: Enabled and configured';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Deploy Supabase Edge Functions';
  RAISE NOTICE '2. Configure Google Cloud Pub/Sub';
  RAISE NOTICE '3. Set up OAuth credentials';
  RAISE NOTICE '4. Initialize Gmail service in your app';
END $$;




