import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

// Configurações do seu Supabase Novo
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fllrtptjwsotmubatocf.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbHJ0cHRqd3NvdG11YmF0b2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTQ2MjYsImV4cCI6MjA4NzE3MDYyNn0.r3T3PX49hxpsF8QOgfQw00Rmz6PC6XmIxBoawWU7EDs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function backupDatabase() {
    console.log('🔄 Iniciando backup da tabela "comercial_actions"...');

    // Busca todos os dados da tabela
    const { data, error } = await supabase
        .from('comercial_actions')
        .select('*');

    if (error) {
        console.error('❌ Erro ao buscar dados do Supabase:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('⚠️ A tabela está vazia. Nenhum backup necessário no momento.');
        return;
    }

    // Gera um nome de arquivo com a data e hora atuais
    const dataAtual = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_crm_${dataAtual}.json`;

    // Salva os dados no computador local
    try {
        fs.writeFileSync(fileName, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Backup concluído com sucesso!`);
        console.log(`📁 Arquivo salvo como: ${fileName} (${data.length} registros)`);
    } catch (err) {
        console.error('❌ Erro ao salvar o arquivo localmente:', err.message);
    }
}

backupDatabase();
