import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fllrtptjwsotmubatocf.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbHJ0cHRqd3NvdG11YmF0b2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTQ2MjYsImV4cCI6MjA4NzE3MDYyNn0.r3T3PX49hxpsF8QOgfQw00Rmz6PC6XmIxBoawWU7EDs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function restaurarDados() {
    console.log('🔄 Lendo o arquivo "DADOS_RESGATADOS_CRM.json"...');
    try {
        const fileContent = fs.readFileSync('DADOS_RESGATADOS_CRM.json', 'utf-8');
        const dadosAntigos = JSON.parse(fileContent);

        // Remove a propriedade "orcamento", pois ela não existia no schema oficial novo, 
        // ou você a criou depois manualmente lá atrás.
        const dadosCorrigidos = dadosAntigos.map(cliente => {
            const { orcamento, ...clienteValido } = cliente;
            return clienteValido;
        });

        console.log(`📤 Enviando ${dadosCorrigidos.length} clientes para o NOVO Banco de Dados...`);

        // O Supabase suporta inserção em lote (bulk insert)
        const { error } = await supabase
            .from('comercial_actions')
            .insert(dadosCorrigidos);

        if (error) {
            console.error('❌ Erro ao restaurar no Supabase:', error.message);
        } else {
            console.log(`\n======================================================`);
            console.log(`🏆 MILAGRE REALIZADO COM SUCESSO! 🏆`);
            console.log(`✅ ${dadosAntigos.length} clientes foram inseridos no NOVO banco!`);
            console.log(`======================================================\n`);
        }
    } catch (err) {
        console.error('❌ Erro na leitura ou envio do arquivo:', err.message);
    }
}

restaurarDados();
