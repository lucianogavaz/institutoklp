
import xlsx from 'xlsx';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Same logic as excelService.js
const PROJECT_ROOT = join(__dirname, '../../');
const BIRTHDAY_FILE = join(PROJECT_ROOT, 'Lista aniversario atualizado KLP.xlsx');

console.log(`Tentando escrever em: ${BIRTHDAY_FILE}`);

try {
    if (fs.existsSync(BIRTHDAY_FILE)) {
        console.log("Arquivo existe.");
    } else {
        console.log("Arquivo NÃO existe.");
    }

    const data = [{ Nome: "Teste", DataNascimento: "01/01/2000", Celular: "123" }];

    // Attempt write
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Planilha1");

    xlsx.writeFile(workbook, BIRTHDAY_FILE);
    console.log("Escrita bem sucedida!");
} catch (error) {
    console.error("Erro ao escrever:", error);
}
