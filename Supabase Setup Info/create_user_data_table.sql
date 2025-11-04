-- Create the user_data table for NoteLoom
-- This table stores user profiles and settings in Supabase for cross-device syncing
-- Run this script in your Supabase SQL Editor

-- Create the user_data table
CREATE TABLE IF NOT EXISTS user_data (
  id BIGSERIAL PRIMARY KEY,
  user_uuid TEXT NOT NULL,
  data_type TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_uuid, data_type)
);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
-- This index helps Supabase quickly find user data by UUID and data type
CREATE INDEX IF NOT EXISTS idx_user_data_uuid_type ON user_data(user_uuid, data_type);

-- Verify the table was created
-- Run this query to see the table structure:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_data';

