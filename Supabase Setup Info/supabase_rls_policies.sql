-- Updated RLS Policies for Secure Access
-- Run this in your Supabase SQL Editor

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can read their own data" ON user_data;
DROP POLICY IF EXISTS "Users can write their own data" ON user_data;
DROP POLICY IF EXISTS "Users can update their own data" ON user_data;
DROP POLICY IF EXISTS "Users can delete their own data" ON user_data;

-- Create a helper function to get the user's UUID from metadata
CREATE OR REPLACE FUNCTION get_user_uuid()
RETURNS TEXT AS $$
DECLARE
  user_uuid_value TEXT;
BEGIN
  -- Try to get UUID from user metadata
  SELECT raw_user_meta_data->>'user_uuid' INTO user_uuid_value
  FROM auth.users
  WHERE id = auth.uid();

  -- If not found in metadata, return null (RLS will block)
  RETURN user_uuid_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure policies that check authenticated user's metadata
-- Users can only read their own data (matching user_uuid from auth metadata)
CREATE POLICY "Users can read their own data"
  ON user_data FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND user_data.user_uuid = get_user_uuid()
  );

-- Users can only insert data with their own user_uuid
CREATE POLICY "Users can insert their own data"
  ON user_data FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_data.user_uuid = get_user_uuid()
  );

-- Users can only update their own data
CREATE POLICY "Users can update their own data"
  ON user_data FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND user_data.user_uuid = get_user_uuid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_data.user_uuid = get_user_uuid()
  );

-- Users can only delete their own data
CREATE POLICY "Users can delete their own data"
  ON user_data FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND user_data.user_uuid = get_user_uuid()
  );
