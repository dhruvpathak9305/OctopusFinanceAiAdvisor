-- =====================================================================
-- TRIGGERS - FINANCIAL RELATIONSHIP TRIGGERS
-- =====================================================================
-- Triggers for automatic financial relationship balance updates
-- =====================================================================

-- =====================================================================
-- UPDATE_RELATIONSHIP_ON_SPLIT (Trigger Function)
-- =====================================================================
-- Purpose: Update financial relationship balance when transaction splits change
-- Trigger: trigger_update_relationship_on_split
-- Event: AFTER INSERT/UPDATE/DELETE on transaction_splits
-- =====================================================================

CREATE OR REPLACE FUNCTION update_relationship_on_split()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Skip if no relationship_id
    IF OLD.relationship_id IS NULL THEN
      RETURN OLD;
    END IF;

    -- Update relationship balance
    PERFORM public.update_financial_relationship_balance(OLD.relationship_id);

    RETURN OLD;
  ELSE
    -- Skip if no relationship_id
    IF NEW.relationship_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Update relationship balance
    PERFORM public.update_financial_relationship_balance(NEW.relationship_id);

    RETURN NEW;
  END IF;
END;
$$;

-- Create the trigger
CREATE TRIGGER trigger_update_relationship_on_split
  AFTER INSERT OR UPDATE OR DELETE ON transaction_splits
  FOR EACH ROW
  EXECUTE FUNCTION update_relationship_on_split();

-- =====================================================================
-- UPDATE_RELATIONSHIP_ON_LOAN (Trigger Function)
-- =====================================================================
-- Purpose: Update financial relationship balance when loans change
-- Trigger: trigger_update_relationship_on_loan
-- Event: AFTER INSERT/UPDATE/DELETE on loans
-- =====================================================================

CREATE OR REPLACE FUNCTION update_relationship_on_loan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Skip if no relationship_id
    IF OLD.relationship_id IS NULL THEN
      RETURN OLD;
    END IF;

    -- Update relationship balance
    PERFORM public.update_financial_relationship_balance(OLD.relationship_id);

    RETURN OLD;
  ELSE
    -- Skip if no relationship_id
    IF NEW.relationship_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Update relationship balance
    PERFORM public.update_financial_relationship_balance(NEW.relationship_id);

    RETURN NEW;
  END IF;
END;
$$;

-- Create the trigger
CREATE TRIGGER trigger_update_relationship_on_loan
  AFTER INSERT OR UPDATE OR DELETE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_relationship_on_loan();

-- =====================================================================
-- UPDATE_RELATIONSHIP_ON_PAYMENT (Trigger Function)
-- =====================================================================
-- Purpose: Update financial relationship balance when loan payments change
-- Trigger: trigger_update_relationship_on_payment
-- Event: AFTER INSERT/UPDATE/DELETE on loan_payments
-- =====================================================================

CREATE OR REPLACE FUNCTION update_relationship_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_relationship_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Get relationship_id from loan
    SELECT relationship_id INTO v_relationship_id
    FROM public.loans
    WHERE id = OLD.loan_id;

    -- Skip if no relationship_id
    IF v_relationship_id IS NULL THEN
      RETURN OLD;
    END IF;

    -- Update relationship balance
    PERFORM public.update_financial_relationship_balance(v_relationship_id);

    RETURN OLD;
  ELSE
    -- Get relationship_id from loan
    SELECT relationship_id INTO v_relationship_id
    FROM public.loans
    WHERE id = NEW.loan_id;

    -- Skip if no relationship_id
    IF v_relationship_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Update relationship balance
    PERFORM public.update_financial_relationship_balance(v_relationship_id);

    RETURN NEW;
  END IF;
END;
$$;

-- Create the trigger
CREATE TRIGGER trigger_update_relationship_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON loan_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_relationship_on_payment();

-- =====================================================================
-- USAGE EXAMPLES
-- =====================================================================

/*
-- Example: Create a transaction split (triggers relationship update)
INSERT INTO transaction_splits (
  transaction_id, user_id, relationship_id, share_amount
) VALUES (
  'transaction-uuid',
  'user-uuid',
  'relationship-uuid',
  25.00
);
-- → Automatically updates financial_relationships.total_amount

-- Example: Create a loan (triggers relationship update)
INSERT INTO loans (
  lender_id, borrower_id, relationship_id, amount, interest_rate
) VALUES (
  'lender-uuid',
  'borrower-uuid', 
  'relationship-uuid',
  1000.00,
  5.5
);
-- → Automatically updates financial_relationships.total_amount

-- Example: Make a loan payment (triggers relationship update)
INSERT INTO loan_payments (
  loan_id, amount, payment_date
) VALUES (
  'loan-uuid',
  100.00,
  NOW()
);
-- → Automatically updates financial_relationships.total_amount

-- Check relationship trigger status:
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%relationship%'
ORDER BY event_object_table, trigger_name;
*/
