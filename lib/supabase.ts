import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Flight {
  id: string;
  user_id: string;
  confirmation_code?: string;
  airline?: string;
  flight_number?: string;
  departure_airport: string;
  departure_city?: string;
  departure_country?: string;
  departure_lat?: number;
  departure_lng?: number;
  departure_date?: string;
  arrival_airport: string;
  arrival_city?: string;
  arrival_country?: string;
  arrival_lat?: number;
  arrival_lng?: number;
  arrival_date?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailSyncStatus {
  id: string;
  user_id: string;
  last_sync_at?: string;
  emails_scanned: number;
  flights_found: number;
  sync_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error_message?: string;
}
