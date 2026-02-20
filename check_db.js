import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fllrtptjwsotmubatocf.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbHJ0cHRqd3NvdG11YmF0b2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTQ2MjYsImV4cCI6MjA4NzE3MDYyNn0.r3T3PX49hxpsF8QOgfQw00Rmz6PC6XmIxBoawWU7EDs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkData() {
    console.log('🔄 Consultando tabela "comercial_actions" como usuário anônimo...');
    const { data, count, error } = await supabase
        .from('comercial_actions')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Erro:', error.message);
    } else {
        console.log(`✅ O banco possui: ${count} registros.`);
    }
}

checkData();
