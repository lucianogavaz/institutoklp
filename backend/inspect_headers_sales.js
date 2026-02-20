import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

console.log(`Lendo arquivo: ${filePath}`);
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
// Exibe as primeiras 5 linhas para encontrar o header real
const data = xlsx.utils.sheet_to_json(sheet, { header: 1, limit: 5 });
data.forEach((row, i) => console.log(`Linha ${i}:`, JSON.stringify(row)));
