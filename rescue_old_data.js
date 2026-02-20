import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// AS CHAVES ANTIGAS DO SEU BANCO DE DADOS ORIGINAL (QUE ESTAVA FUNCIONANDO ATÉ HOJE)
const OLD_SUPABASE_URL = 'https://yhycmovftnpsplrcjoac.supabase.co';
const OLD_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeWNtb3ZmdG5wc3BscmNqb2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjM1OTIsImV4cCI6MjA4NjgzOTU5Mn0.66T9FKK_GpUdhXdSq4djo-urwUXdk-QpOugEWNbcdKk';

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY);

async function resgatarDadosAntigos() {
    console.log('🔄 Conectando ao Banco de Dados ANTIGO... O resgate começou!');

    // Busca todos os dados da tabela original
    const { data, error } = await oldSupabase
        .from('comercial_actions')
        .select('*');

    if (error) {
        console.error('❌ Erro gravíssimo ao buscar dados do Supabase antigo:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('⚠️ A tabela antiga está vazia.');
        return;
    }

    // Salva os dados no computador local
    try {
        fs.writeFileSync('DADOS_RESGATADOS_CRM.json', JSON.stringify(data, null, 2), 'utf8');
        console.log(`\n======================================================`);
        console.log(`🎉 RESGATE CONCLUÍDO COM SUCESSO VERDADEIRO! 🎉`);
        console.log(`✅ Conseguimos salvar ${data.length} CLIENTES ANTIGOS que estavam perdidos!`);
        console.log(`📁 Verifique o arquivo: "DADOS_RESGATADOS_CRM.json" que acabou de aparecer na sua pasta!`);
        console.log(`======================================================\n`);
    } catch (err) {
        console.error('❌ Erro ao salvar o arquivo localmente:', err.message);
    }
}

resgatarDadosAntigos();
