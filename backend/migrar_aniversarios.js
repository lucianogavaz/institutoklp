import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuração do Supabase (Chaves corretas extraídas de src/services/supabaseClient.ts)
const SUPABASE_URL = 'https://yhycmovftnpsplrcjoac.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeWNtb3ZmdG5wc3BscmNqb2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjM1OTIsImV4cCI6MjA4NjgzOTU5Mn0.66T9FKK_GpUdhXdSq4djo-urwUXdk-QpOugEWNbcdKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ajustando o caminho para voltar duas pastas (saindo de backend -> crm-klp -> planilha)
const filePath = join(__dirname, '../../aniversarios_klp.xlsx');

async function importBirthdays() {
    console.log(`Lendo arquivo: ${filePath}`);

    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log(`Total de registros encontrados no Excel: ${data.length}`);

        if (data.length === 0) {
            console.log("Nenhum dado encontrado para importar.");
            return;
        }

        console.log("Exemplo de registro do Excel:", data[0]);

        const recordsToInsert = data.map(item => ({
            // Mapeamento ajustado para corresponder à tabela birthdays do Supabase
            // IMPORTANTE: Supabase geralmente espera nomes exatos das colunas.
            // Vou usar 'nome', 'data_nascimento', 'celular' em minúsculo se a tabela foi criada via SQL padrão.
            // Se foi criada via UI sem aspas, é minúsculo.
            // O código do front usa PascalCase na interface TS, mas snake_case no banco?
            // Vamos verificar o erro se houver, mas assumirei os nomes das colunas baseados no create table do passo 158 (que eu sugeri).
            // A sugestão foi: create table public.birthdays ( nome, data_nascimento, celular ).
            nome: item['Nome'] || item['nome'] || item['NOME'],
            data_nascimento: item['Data Nascimento'] || item['data nascimento'] || item['DATA NASCIMENTO'] || item['Data'] || item['Aniversario'],
            celular: item['Celular'] || item['celular'] || item['CELULAR'] || item['Telefone']
        })).filter(item => item.nome);

        console.log(`Registros válidos para inserção: ${recordsToInsert.length}`);

        // Inserir em lotes para não sobrecarregar
        const batchSize = 100;
        for (let i = 0; i < recordsToInsert.length; i += batchSize) {
            const batch = recordsToInsert.slice(i, i + batchSize);
            const { error } = await supabase
                .from('birthdays')
                .insert(batch);

            if (error) {
                console.error(`Erro ao inserir lote ${i}:`, error.message);
                // Se o erro for "column not found", saberemos que os nomes das colunas estão errados.
            } else {
                if (i % 1000 === 0) console.log(`Progresso: ${i} / ${recordsToInsert.length} inseridos...`);
            }
        }

        console.log("Importação concluída com sucesso!");

    } catch (error) {
        console.error("Erro fatal na importação:", error.message);
    }
}

importBirthdays();
