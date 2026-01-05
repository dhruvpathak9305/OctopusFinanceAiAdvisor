-- =====================================================================
-- BILL TRIGGERS AND FUNCTIONS - PHASE 1
-- =====================================================================
-- Migration: 20250115_bill_triggers_and_functions.sql
-- Description: Database triggers and functions for bill payment automation,
--              next due date calculation, and transaction creation
-- =====================================================================

-- =====================================================================
-- FUNCTION: Update next due date when bill is paid
-- =====================================================================
CREATE OR REPLACE FUNCTION update_next_due_date_for_recurring_bills()
RETURNS TRIGGER AS $$
DECLARE
  calculated_next_date DATE;
BEGIN
  -- Only process if bill status changed to 'paid' and it's a recurring bill
  IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.frequency != 'one-time' THEN
    -- Calculate next due date
    calculated_next_date := calculate_next_due_date(
      NEW.due_date, 
      NEW.frequency, 
      NEW.recurrence_pattern
    );
    
    -- Check if bill should end based on end_date
    IF NEW.end_date IS NOT NULL AND calculated_next_date > NEW.end_date THEN
      NEW.is_active := false;
      NEW.next_due_date := NULL;
    -- Check if bill should end based on recurrence_count
    ELSIF NEW.recurrence_count IS NOT NULL AND NEW.payment_count >= NEW.recurrence_count THEN
      NEW.is_active := false;
      NEW.next_due_date := NULL;
    ELSE
      NEW.next_due_date := calculated_next_date;
    END IF;
    
    -- Update payment tracking
    IF NEW.last_paid_date IS NULL OR NEW.due_date > NEW.last_paid_date THEN
      NEW.last_paid_date := NEW.due_date;
      NEW.last_paid_amount := NEW.amount;
    END IF;
    
    NEW.total_paid_amount := COALESCE(NEW.total_paid_amount, 0) + NEW.amount;
    NEW.payment_count := COALESCE(NEW.payment_count, 0) + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- TRIGGER: Update next due date on bill payment
-- =====================================================================
DROP TRIGGER IF EXISTS trigger_update_next_due_date ON upcoming_bills;
CREATE TRIGGER trigger_update_next_due_date
  BEFORE UPDATE ON upcoming_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_next_due_date_for_recurring_bills();

-- =====================================================================
-- FUNCTION: Create transaction when bill is marked as paid
-- =====================================================================
CREATE OR REPLACE FUNCTION create_transaction_from_bill()
RETURNS TRIGGER AS $$
DECLARE
  new_transaction_id UUID;
  payment_account_id UUID;
  payment_credit_card_id UUID;
BEGIN
  -- Only create transaction if bill status changed to 'paid'
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Determine payment source
    payment_account_id := COALESCE(NEW.account_id, NEW.autopay_account_id);
    payment_credit_card_id := COALESCE(NEW.credit_card_id, NEW.autopay_credit_card_id);
    
    -- Only create transaction if we have a payment source
    IF payment_account_id IS NOT NULL OR payment_credit_card_id IS NOT NULL THEN
      -- Create transaction record
      INSERT INTO transactions (
        user_id,
        account_id,
        category_id,
        subcategory_id,
        amount,
        description,
        transaction_date,
        type,
        status,
        reference,
        metadata
      ) VALUES (
        NEW.user_id,
        payment_account_id,
        NEW.category_id,
        NEW.subcategory_id,
        NEW.amount,
        NEW.name || ' - Bill Payment',
        NEW.due_date,
        'expense',
        'completed',
        'bill_payment_' || NEW.id::text,
        jsonb_build_object(
          'bill_id', NEW.id,
          'bill_name', NEW.name,
          'payment_method', CASE 
            WHEN payment_account_id IS NOT NULL THEN 'account'
            WHEN payment_credit_card_id IS NOT NULL THEN 'credit_card'
            ELSE 'unknown'
          END
        )
      ) RETURNING id INTO new_transaction_id;
      
      -- Link transaction to bill
      NEW.transaction_id := new_transaction_id;
      
      -- Create payment record in bill_payments
      INSERT INTO bill_payments (
        bill_id,
        user_id,
        payment_date,
        amount,
        payment_method,
        transaction_id,
        account_id,
        credit_card_id,
        status,
        metadata
      ) VALUES (
        NEW.id,
        NEW.user_id,
        NEW.due_date,
        NEW.amount,
        CASE 
          WHEN payment_account_id IS NOT NULL THEN 'account'
          WHEN payment_credit_card_id IS NOT NULL THEN 'credit_card'
          ELSE 'other'
        END,
        new_transaction_id,
        payment_account_id,
        payment_credit_card_id,
        'completed',
        jsonb_build_object(
          'auto_created', true,
          'bill_frequency', NEW.frequency
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- TRIGGER: Create transaction on bill payment
-- =====================================================================
DROP TRIGGER IF EXISTS trigger_create_transaction_from_bill ON upcoming_bills;
CREATE TRIGGER trigger_create_transaction_from_bill
  AFTER UPDATE ON upcoming_bills
  FOR EACH ROW
  WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
  EXECUTE FUNCTION create_transaction_from_bill();

-- =====================================================================
-- FUNCTION: Update account balance when bill is paid
-- =====================================================================
CREATE OR REPLACE FUNCTION update_account_balance_on_bill_payment()
RETURNS TRIGGER AS $$
DECLARE
  payment_account_id UUID;
  payment_credit_card_id UUID;
BEGIN
  -- Only process if bill status changed to 'paid'
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Determine payment source
    payment_account_id := COALESCE(NEW.account_id, NEW.autopay_account_id);
    payment_credit_card_id := COALESCE(NEW.credit_card_id, NEW.autopay_credit_card_id);
    
    -- Update account balance if paid from account
    IF payment_account_id IS NOT NULL THEN
      UPDATE accounts
      SET balance = balance - NEW.amount,
          updated_at = NOW()
      WHERE id = payment_account_id;
    END IF;
    
    -- Update credit card balance if paid from credit card
    IF payment_credit_card_id IS NOT NULL THEN
      UPDATE credit_cards
      SET current_balance = current_balance + NEW.amount,
          updated_at = NOW()
      WHERE id = payment_credit_card_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- TRIGGER: Update account/credit card balance on bill payment
-- =====================================================================
DROP TRIGGER IF EXISTS trigger_update_balance_on_bill_payment ON upcoming_bills;
CREATE TRIGGER trigger_update_balance_on_bill_payment
  AFTER UPDATE ON upcoming_bills
  FOR EACH ROW
  WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
  EXECUTE FUNCTION update_account_balance_on_bill_payment();

-- =====================================================================
-- FUNCTION: Auto-update bill status to overdue
-- =====================================================================
CREATE OR REPLACE FUNCTION update_overdue_bills()
RETURNS void AS $$
BEGIN
  UPDATE upcoming_bills
  SET status = 'overdue',
      updated_at = NOW()
  WHERE status IN ('upcoming', 'pending')
    AND due_date < CURRENT_DATE
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- FUNCTION: Generate next bill occurrence for recurring bills
-- =====================================================================
CREATE OR REPLACE FUNCTION generate_next_bill_occurrence(bill_id_param UUID)
RETURNS UUID AS $$
DECLARE
  original_bill RECORD;
  new_bill_id UUID;
BEGIN
  -- Get original bill details
  SELECT * INTO original_bill
  FROM upcoming_bills
  WHERE id = bill_id_param;
  
  -- Check if bill should generate next occurrence
  IF original_bill.status = 'paid' 
     AND original_bill.frequency != 'one-time'
     AND original_bill.is_active = true
     AND original_bill.next_due_date IS NOT NULL THEN
    
    -- Check if next occurrence already exists
    IF NOT EXISTS (
      SELECT 1 FROM upcoming_bills
      WHERE user_id = original_bill.user_id
        AND name = original_bill.name
        AND due_date = original_bill.next_due_date
        AND status IN ('upcoming', 'pending')
    ) THEN
      -- Create new bill occurrence
      INSERT INTO upcoming_bills (
        user_id,
        name,
        description,
        amount,
        due_date,
        frequency,
        category_id,
        subcategory_id,
        account_id,
        credit_card_id,
        autopay,
        autopay_source,
        autopay_account_id,
        autopay_credit_card_id,
        status,
        is_active,
        reminder_enabled,
        is_included_in_budget,
        budget_period,
        tags,
        notes,
        metadata
      ) VALUES (
        original_bill.user_id,
        original_bill.name,
        original_bill.description,
        original_bill.amount,
        original_bill.next_due_date,
        original_bill.frequency,
        original_bill.category_id,
        original_bill.subcategory_id,
        original_bill.account_id,
        original_bill.credit_card_id,
        original_bill.autopay,
        original_bill.autopay_source,
        original_bill.autopay_account_id,
        original_bill.autopay_credit_card_id,
        'upcoming',
        true,
        original_bill.reminder_enabled,
        original_bill.is_included_in_budget,
        original_bill.budget_period,
        original_bill.tags,
        original_bill.notes,
        jsonb_build_object(
          'parent_bill_id', original_bill.id,
          'auto_generated', true
        )
      ) RETURNING id INTO new_bill_id;
      
      RETURN new_bill_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- COMMENTS
-- =====================================================================
COMMENT ON FUNCTION update_next_due_date_for_recurring_bills() IS 
  'Automatically calculates and updates next_due_date when a recurring bill is paid';

COMMENT ON FUNCTION create_transaction_from_bill() IS 
  'Creates a transaction record and payment history when a bill is marked as paid';

COMMENT ON FUNCTION update_account_balance_on_bill_payment() IS 
  'Updates account or credit card balance when a bill is paid';

COMMENT ON FUNCTION update_overdue_bills() IS 
  'Updates bill status to overdue for bills past their due date';

COMMENT ON FUNCTION generate_next_bill_occurrence(UUID) IS 
  'Generates the next occurrence of a recurring bill after payment';

