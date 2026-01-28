-- SkyTrace Database Schema

-- Users table (synced with NextAuth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flights table
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Flight details
  confirmation_code TEXT,
  airline TEXT,
  flight_number TEXT,
  
  -- Departure
  departure_airport TEXT NOT NULL,
  departure_city TEXT,
  departure_country TEXT,
  departure_lat DECIMAL(10, 8),
  departure_lng DECIMAL(11, 8),
  departure_date TIMESTAMP WITH TIME ZONE,
  
  -- Arrival
  arrival_airport TEXT NOT NULL,
  arrival_city TEXT,
  arrival_country TEXT,
  arrival_lat DECIMAL(10, 8),
  arrival_lng DECIMAL(11, 8),
  arrival_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  raw_email_subject TEXT,
  raw_email_body TEXT,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email sync status table
CREATE TABLE IF NOT EXISTS email_sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  last_sync_at TIMESTAMP WITH TIME ZONE,
  emails_scanned INTEGER DEFAULT 0,
  flights_found INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create indexes separately (correct PostgreSQL syntax)
CREATE INDEX IF NOT EXISTS idx_flights_user_id ON flights(user_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure_date ON flights(departure_date);
CREATE INDEX IF NOT EXISTS idx_flights_departure_airport ON flights(departure_airport);
CREATE INDEX IF NOT EXISTS idx_flights_arrival_airport ON flights(arrival_airport);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sync_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own flights"
  ON flights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flights"
  ON flights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flights"
  ON flights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flights"
  ON flights FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sync status"
  ON email_sync_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sync status"
  ON email_sync_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync status"
  ON email_sync_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);
