# Expense Splitting Database Schema

This document describes the database schema for the expense splitting feature.

## Tables

### Groups

```sql
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  group_image_url TEXT,

  PRIMARY KEY (id)
);
```

Stores information about expense-sharing groups.

### Group Members

```sql
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id),
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  user_name TEXT,
  user_email TEXT,
  user_avatar TEXT,
  is_registered_user BOOLEAN NOT NULL DEFAULT false,

  PRIMARY KEY (id),
  UNIQUE (group_id, user_id)
);
```

Tracks membership in expense-sharing groups.

### Individual Contacts

```sql
CREATE TABLE public.individual_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,

  PRIMARY KEY (id),
  UNIQUE (user_id, contact_email)
);
```

Stores contacts for individual expense splitting.

### Transaction Splits

```sql
CREATE TABLE public.transaction_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id),
  user_id UUID NOT NULL,
  group_id UUID REFERENCES public.groups(id),
  share_amount NUMERIC(12,2) NOT NULL,
  share_percentage NUMERIC(5,2),
  split_type TEXT NOT NULL DEFAULT 'equal',
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_by UUID,
  settled_at TIMESTAMP WITH TIME ZONE,
  settlement_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id)
);
```

Records how transactions are split among participants.

## Indexes

```sql
CREATE INDEX idx_groups_created_by ON public.groups(created_by);
CREATE INDEX idx_groups_active ON public.groups(is_active) WHERE is_active = true;

CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_group_members_active ON public.group_members(is_active) WHERE is_active = true;

CREATE INDEX idx_individual_contacts_user_id ON public.individual_contacts(user_id);
CREATE INDEX idx_individual_contacts_email ON public.individual_contacts(contact_email);
CREATE INDEX idx_individual_contacts_active ON public.individual_contacts(is_active) WHERE is_active = true;

CREATE INDEX idx_transaction_splits_transaction_id ON public.transaction_splits(transaction_id);
CREATE INDEX idx_transaction_splits_user_id ON public.transaction_splits(user_id);
CREATE INDEX idx_transaction_splits_group_id ON public.transaction_splits(group_id);
CREATE INDEX idx_transaction_splits_unpaid ON public.transaction_splits(is_paid) WHERE is_paid = false;
```

## Row Level Security (RLS)

All tables have RLS policies to ensure users can only access their own data:

```sql
-- Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own groups" ON public.groups
  FOR SELECT USING (created_by = auth.uid());

-- Group Members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view group memberships for their groups" ON public.group_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    group_id IN (SELECT id FROM public.groups WHERE created_by = auth.uid())
  );

-- Individual Contacts
ALTER TABLE public.individual_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own contacts" ON public.individual_contacts
  FOR SELECT USING (user_id = auth.uid());

-- Transaction Splits
ALTER TABLE public.transaction_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own splits" ON public.transaction_splits
  FOR SELECT USING (user_id = auth.uid());
```

## Functions

### add_or_get_individual_contact

```sql
CREATE OR REPLACE FUNCTION public.add_or_get_individual_contact(
  p_contact_email TEXT,
  p_contact_name TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contact_id UUID;
  v_user_id UUID;
  v_contact_name TEXT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Set contact name
  v_contact_name := COALESCE(p_contact_name, split_part(p_contact_email, '@', 1));

  -- Try to get existing contact
  SELECT id INTO v_contact_id
  FROM public.individual_contacts
  WHERE user_id = v_user_id AND contact_email = p_contact_email AND is_active = true;

  -- If contact doesn't exist, create it
  IF v_contact_id IS NULL THEN
    INSERT INTO public.individual_contacts (
      user_id,
      contact_name,
      contact_email
    ) VALUES (
      v_user_id,
      v_contact_name,
      p_contact_email
    )
    RETURNING id INTO v_contact_id;
  END IF;

  RETURN v_contact_id;
END;
$$;
```

Creates or retrieves an individual contact.

### create_test_contacts

```sql
CREATE OR REPLACE FUNCTION public.create_test_contacts()
RETURNS void AS
$$
BEGIN
  INSERT INTO public.individual_contacts (user_id, contact_name, contact_email)
  SELECT auth.uid(), 'Test Contact', 'test@example.com'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.individual_contacts
    WHERE user_id = auth.uid() AND contact_email = 'test@example.com'
  );
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;
```

Creates a test contact for development purposes.
