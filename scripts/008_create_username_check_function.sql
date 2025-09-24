-- Create a function to check if username exists in profiles table
-- This helps prevent registration conflicts

CREATE OR REPLACE FUNCTION check_username_exists(username_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if username exists in profiles table
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE username = username_to_check
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_username_exists(text) TO authenticated;