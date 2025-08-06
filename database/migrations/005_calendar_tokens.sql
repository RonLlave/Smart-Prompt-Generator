-- Create user_calendar_tokens table for Google Calendar integration
CREATE TABLE IF NOT EXISTS user_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own calendar tokens
CREATE POLICY "Users can view own calendar tokens" ON user_calendar_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar tokens" ON user_calendar_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar tokens" ON user_calendar_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar tokens" ON user_calendar_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_calendar_tokens_user_id ON user_calendar_tokens(user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_calendar_tokens_updated_at 
  BEFORE UPDATE ON user_calendar_tokens 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();