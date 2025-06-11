const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rota para iniciar o navegador controlado
let browser;
let page;

app.get('/init-browser', async (req, res) => {
    try {
        browser = await puppeteer.launch({
            headless: false, // Modo headless desativado para visualização
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        await page.goto('https://rhbahia.ba.gov.br/');
        
        res.status(200).json({ 
            status: 'success',
            message: 'Navegador iniciado. Faça o login manualmente e depois volte para a aplicação.'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para buscar PDFs
app.post('/get-pdf', async (req, res) => {
    const { matricula, ano, mes } = req.body;
    
    if (!page) {
        return res.status(400).json({ error: 'Navegador não inicializado. Por favor, inicie o navegador primeiro.' });
    }

    try {
        const url = `https://rhbahia.ba.gov.br/auditor/contracheque/file/pdf/${ano}/${mes}/1/${matricula}`;
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Verifica se o PDF foi carregado
        const content = await page.content();
        if (content.includes('PDF')) {
            res.status(200).json({ url });
        } else {
            res.status(404).json({ error: 'PDF não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});