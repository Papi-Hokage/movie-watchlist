import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// The anon key is safe to ship to the browser: Row Level Security
// policies in supabase/schema.sql restrict every user to their own rows.
export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
