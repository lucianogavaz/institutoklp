import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    const file = join(__dirname, '../aniversarios_klp.xlsx');
    console.log(`Lendo arquivo: ${file}`);
    const workbook = xlsx.readFile(file);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, limit: 1 });
    console.log('HEADERS_ANIVERSARIOS:', JSON.stringify(data[0]));
} catch (e) {
    console.error('Erro ao ler aniversarios:', e.message);
}
