const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

let browser;
let page;

app.use(express.static('public'));

// Inicia o navegador e abre o site manualmente
app.get('/abrir-login', async (req, res) => {
  browser = await puppeteer.launch({
    headless: false, // exibe o navegador (necessário para login manual)
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  page = await browser.newPage();
  await page.goto('https://rhbahia.ba.gov.br/');
  res.send('Navegador aberto no servidor. Faça o login manual.');
});

// Rota para obter um PDF autenticado (proxy)
app.get('/pdf/:ano/:mes/:matricula', async (req, res) => {
  const { ano, mes, matricula } = req.params;

  if (!page) return res.status(400).send('Login ainda não foi feito.');

  const pdfUrl = `https://rhbahia.ba.gov.br/auditor/contracheque/file/pdf/${ano}/${mes}/1/${matricula}`;
  const response = await page.goto(pdfUrl, { waitUntil: 'networkidle2' });

  const buffer = await response.buffer();
  res.contentType('application/pdf');
  res.send(buffer);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
