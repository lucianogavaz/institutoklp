
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yhycmovftnpsplrcjoac.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeWNtb3ZmdG5wc3BscmNqb2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjM1OTIsImV4cCI6MjA4NjgzOTU5Mn0.66T9FKK_GpUdhXdSq4djo-urwUXdk-QpOugEWNbcdKk';

// Force usage if available, but log warning if missing in production build
if (!import.meta.env.VITE_SUPABASE_URL) {
    console.warn('VITE_SUPABASE_URL not found, using fallback.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
