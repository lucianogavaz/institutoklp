
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getBirthdays, getSales, saveBirthdays, saveSales } from './services/excelService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rota de Status
app.get('/status', (req, res) => {
    res.json({ status: 'API Online', timestamp: new Date() });
});

// Rotas de Dados
app.get('/api/birthdays', async (req, res) => {
    try {
        const data = await getBirthdays();
        res.json(data);
    } catch (error) {
        console.error('Erro ao ler aniversários:', error);
        res.status(500).json({ error: 'Erro ao ler arquivo de aniversários' });
    }
});

app.post('/api/birthdays', async (req, res) => {
    try {
        const result = await saveBirthdays(req.body);
        res.json(result);
    } catch (error) {
        console.error('Erro ao salvar aniversários:', error);
        res.status(500).json({ error: error.message || 'Não foi possível salvar os dados.' });
    }
});

app.get('/api/sales', async (req, res) => {
    try {
        const data = await getSales();
        res.json(data);
    } catch (error) {
        console.error('Erro ao ler vendas:', error);
        res.status(500).json({ error: 'Erro ao ler arquivo de vendas' });
    }
});

app.post('/api/sales', async (req, res) => {
    try {
        const result = await saveSales(req.body);
        res.json(result);
    } catch (error) {
        console.error('Erro ao salvar vendas:', error);
        res.status(500).json({ error: error.message || 'Não foi possível salvar os dados comerciais.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend rodando em http://localhost:${PORT}`);
    console.log(`📂 Servidor servindo arquivos da raiz do projeto: ${join(__dirname, '../../')}`);
});
