-- Individual Member Attendance Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS member_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id TEXT,          -- optional event UUID or identifier
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    attended BOOLEAN DEFAULT TRUE,
    marked_by UUID REFERENCES auth.users(id), -- admin who scanned
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, event_name, event_date)  -- prevent duplicates
);

-- Enable RLS
ALTER TABLE member_attendance ENABLE ROW LEVEL SECURITY;

-- Members can see their own attendance
CREATE POLICY "Members can view own attendance" ON member_attendance
    FOR SELECT USING (auth.uid() = user_id);

-- Admins (service role) can insert
-- No INSERT policy needed as service role bypasses RLS
