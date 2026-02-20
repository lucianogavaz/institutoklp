import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Configuração do Supabase (Mesmas chaves que funcionaram)
const SUPABASE_URL = 'https://yhycmovftnpsplrcjoac.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeWNtb3ZmdG5wc3BscmNqb2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjM1OTIsImV4cCI6MjA4NjgzOTU5Mn0.66T9FKK_GpUdhXdSq4djo-urwUXdk-QpOugEWNbcdKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho do arquivo Excel
const possiblePaths = [
    join(__dirname, '../../comercial_klp.xlsx')
];

let filePath = '';
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        filePath = p;
        break;
    }
}

if (!filePath) {
    console.error("Arquivo comercial_klp.xlsx não encontrado em lugar nenhum!");
    process.exit(1);
}

async function importSales() {
    console.log(`Lendo arquivo: ${filePath}`);

    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Primeiro sheet
        const sheet = workbook.Sheets[sheetName];

        // Ler como array de arrays para inspecionar linhas
        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        console.log(`Total de linhas brutas: ${rawData.length}`);

        // Encontrar a linha de cabeçalho
        let headerRowIndex = -1;
        let headers = [];

        for (let i = 0; i < Math.min(20, rawData.length); i++) {
            const row = rawData[i];
            // Procura por colunas chave (DATA, CLIENTE, FONE)
            // Normaliza para string e uppercase para comparar
            const rowString = JSON.stringify(row).toUpperCase();
            if (rowString.includes("DATA") && (rowString.includes("CLIENTE") || rowString.includes("NOME"))) {
                headerRowIndex = i;
                headers = row;
                console.log(`Cabeçalho encontrado na linha ${i + 1}:`, headers);
                break;
            }
        }

        if (headerRowIndex === -1) {
            console.error("Não foi possível encontrar a linha de cabeçalho (DATA, CLIENTE ou NOME).");
            return;
        }

        // Processar os dados a partir da linha seguinte ao cabeçalho
        const recordsToInsert = [];

        // Mapa de colunas (índice -> nome do campo no banco)
        // Baseado na tabela `comercial_actions` (snake_case)
        const columnMap = {};

        headers.forEach((h, index) => {
            if (!h) return;
            const header = h.toString().trim().toUpperCase();

            if (header === 'DATA') columnMap[index] = 'data';
            else if (header === 'CLIENTE' || header === 'NOME') columnMap[index] = 'nome';
            else if (header.includes('FONE') || header.includes('CELULAR') || header.includes('TELEFONE')) columnMap[index] = 'fone';
            else if (header.includes('AÇÃO') || header.includes('ACAO') || header === 'TIPO') columnMap[index] = 'acao';
            else if (header.includes('ORIGEM') || header.includes('CAMPANHA')) columnMap[index] = 'origem_campanha';
            else if (header.includes('CANAL')) columnMap[index] = 'canal_venda';
            else if (header.includes('STATUS')) columnMap[index] = 'status_atendimento';
            else if (header.includes('FECHAMENTO')) columnMap[index] = 'fechamento';
            else if (header.includes('VALOR')) columnMap[index] = 'valor';
            else if (header.includes('PROCEDIMENTO')) columnMap[index] = 'tipo_procedimento';
            else if (header.includes('PROFISSIONAL')) columnMap[index] = 'profissional';
            else if (header.includes('OBS') || header.includes('OBSERVAÇÕES')) columnMap[index] = 'observacoes';
            else if (header.includes('ORÇAMENTO') || header.includes('ORCAMENTO')) columnMap[index] = 'orcamento'; // Se existir
        });

        console.log("Mapeamento de colunas:", columnMap);

        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue; // Pula linhas vazias

            const record = {};
            let hasData = false;

            for (const [colIndex, fieldName] of Object.entries(columnMap)) {
                let value = row[colIndex];

                // Tratamento especial para datas do Excel (número serial)
                if (fieldName === 'data' && typeof value === 'number') {
                    // Converter data serial Excel para formato DD/MM/YYYY ou YYYY-MM-DD
                    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
                    // Ajuste de fuso horário simples (adicionar horas se necessário, ou usar UTC)
                    // O Excel baseia-se em dias desde 1900.
                    // Vamos tentar formatar como DD/MM/YYYY text
                    const d = date.getUTCDate();
                    const m = date.getUTCMonth() + 1;
                    const y = date.getUTCFullYear();
                    value = `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
                }

                // Tratamento para valor (remover R$, converter para número)
                if ((fieldName === 'valor' || fieldName === 'orcamento') && typeof value === 'string') {
                    value = parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
                }

                if (value !== undefined && value !== null && value !== '') {
                    record[fieldName] = value;
                    hasData = true;
                }
            }

            if (hasData && record.nome) { // Só insere se tiver nome
                recordsToInsert.push(record);
            }
        }

        console.log(`Total de registros válidos para inserção: ${recordsToInsert.length}`);

        if (recordsToInsert.length > 0) {
            console.log("Exemplo de registro processado:", recordsToInsert[0]);
        }

        // Inserir em lotes
        const batchSize = 100;
        for (let i = 0; i < recordsToInsert.length; i += batchSize) {
            const batch = recordsToInsert.slice(i, i + batchSize);
            const { error } = await supabase
                .from('comercial_actions')
                .insert(batch);

            if (error) {
                console.error(`Erro ao inserir lote ${i}:`, error.message);
            } else {
                if (i % 500 === 0) console.log(`Progresso: ${i} / ${recordsToInsert.length} inseridos...`);
            }
        }

        console.log("Importação concluída com sucesso!");

    } catch (error) {
        console.error("Erro fatal na importação:", error.message);
    }
}

importSales();
