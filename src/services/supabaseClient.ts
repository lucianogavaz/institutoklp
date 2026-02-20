
import { createClient } from '@supabase/supabase-js';

// Ignorando as Variaveis de ambiente da Netlify para garantir que vai conectar no banco novo!
const SUPABASE_URL = 'https://fllrtptjwsotmubatocf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbHJ0cHRqd3NvdG11YmF0b2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTQ2MjYsImV4cCI6MjA4NzE3MDYyNn0.r3T3PX49hxpsF8QOgfQw00Rmz6PC6XmIxBoawWU7EDs';

// Force usage if available, but log warning if missing in production build
if (!import.meta.env.VITE_SUPABASE_URL) {
    console.warn('VITE_SUPABASE_URL not found, using fallback.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
