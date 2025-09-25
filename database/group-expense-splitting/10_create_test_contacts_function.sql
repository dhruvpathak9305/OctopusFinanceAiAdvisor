-- Function to create a test contact for the current user
-- This helps with debugging and ensures at least one contact exists for testing
-- Security definer allows the function to bypass RLS policies
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