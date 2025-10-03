-- Check what's in the balance_real table
SELECT 
  br.account_id,
  br.account_name,
  br.institution_name,
  br.account_type,
  br.current_balance,
  br.opening_balance,
  br.last_updated,
  ar.name as account_name_from_accounts,
  ar.institution as institution_from_accounts
FROM balance_real br
LEFT JOIN accounts_real ar ON br.account_id = ar.id
ORDER BY br.last_updated DESC;

-- Also check if there are accounts without balance records
SELECT 
  ar.id,
  ar.name,
  ar.institution,
  ar.type,
  CASE 
    WHEN br.account_id IS NULL THEN 'NO BALANCE RECORD'
    ELSE 'HAS BALANCE RECORD'
  END as balance_status
FROM accounts_real ar
LEFT JOIN balance_real br ON ar.id = br.account_id
ORDER BY ar.created_at DESC;
