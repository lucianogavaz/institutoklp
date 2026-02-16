
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yhycmovftnpsplrcjoac.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeWNtb3ZmdG5wc3BscmNqb2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjM1OTIsImV4cCI6MjA4NjgzOTU5Mn0.66T9FKK_GpUdhXdSq4djo-urwUXdk-QpOugEWNbcdKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
