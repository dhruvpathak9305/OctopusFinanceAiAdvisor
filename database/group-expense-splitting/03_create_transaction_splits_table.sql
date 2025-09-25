-- Create transaction_splits table for expense splitting
CREATE TABLE IF NOT EXISTS public.transaction_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  user_id UUID NOT NULL,
  group_id UUID, -- Nullable: can be individual split or group split
  share_amount NUMERIC NOT NULL,
  share_percentage NUMERIC, -- Optional: store percentage for reference
  split_type TEXT NOT NULL DEFAULT 'equal', -- 'equal', 'percentage', 'custom', 'amount'
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_by UUID, -- User who paid for this split (nullable)
  settled_at TIMESTAMP WITH TIME ZONE,
  settlement_method TEXT, -- 'cash', 'upi', 'bank_transfer', 'other'
  notes TEXT, -- Optional notes for the split
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT transaction_splits_pkey PRIMARY KEY (id),
  CONSTRAINT transaction_splits_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions_real (id) ON DELETE CASCADE,
  CONSTRAINT transaction_splits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT transaction_splits_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups (id) ON DELETE SET NULL,
  CONSTRAINT transaction_splits_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES auth.users (id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT transaction_splits_share_amount_positive CHECK (share_amount > 0),
  CONSTRAINT transaction_splits_share_percentage_valid CHECK (share_percentage IS NULL OR (share_percentage >= 0 AND share_percentage <= 100)),
  CONSTRAINT transaction_splits_split_type_check CHECK (split_type IN ('equal', 'percentage', 'custom', 'amount')),
  CONSTRAINT transaction_splits_settlement_method_check CHECK (settlement_method IS NULL OR settlement_method IN ('cash', 'upi', 'bank_transfer', 'other')),
  
  -- Ensure unique user per transaction split
  CONSTRAINT transaction_splits_unique_user_transaction UNIQUE (transaction_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_splits_transaction_id ON public.transaction_splits USING btree (transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_user_id ON public.transaction_splits USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_group_id ON public.transaction_splits USING btree (group_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_unpaid ON public.transaction_splits USING btree (user_id, is_paid) WHERE is_paid = false;
CREATE INDEX IF NOT EXISTS idx_transaction_splits_group_unpaid ON public.transaction_splits USING btree (group_id, is_paid) WHERE is_paid = false AND group_id IS NOT NULL;

-- Add RLS (Row Level Security)
ALTER TABLE public.transaction_splits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see splits for transactions they're involved in
CREATE POLICY "Users can view relevant transaction splits" ON public.transaction_splits
  FOR SELECT USING (
    user_id = auth.uid() OR 
    transaction_id IN (
      SELECT id FROM public.transactions_real 
      WHERE user_id = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Transaction owners can create splits
CREATE POLICY "Transaction owners can create splits" ON public.transaction_splits
  FOR INSERT WITH CHECK (
    transaction_id IN (
      SELECT id FROM public.transactions_real 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their own split status
CREATE POLICY "Users can update their splits" ON public.transaction_splits
  FOR UPDATE USING (
    user_id = auth.uid() OR
    transaction_id IN (
      SELECT id FROM public.transactions_real 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Transaction owners can delete splits
CREATE POLICY "Transaction owners can delete splits" ON public.transaction_splits
  FOR DELETE USING (
    transaction_id IN (
      SELECT id FROM public.transactions_real 
      WHERE user_id = auth.uid()
    )
  );
