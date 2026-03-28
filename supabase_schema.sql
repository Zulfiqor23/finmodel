-- Create the table for FinModel scenarios
CREATE TABLE finmodel_scenarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  inputs jsonb NOT NULL
);

-- Enable Row Level Security (RLS) but allow anonymous access for this specific table
ALTER TABLE finmodel_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access"
ON finmodel_scenarios FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous insert access"
ON finmodel_scenarios FOR INSERT
TO anon
WITH CHECK (true);
