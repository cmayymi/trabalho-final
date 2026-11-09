const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/saude', (req, res) => res.json({ ok: true }));

const PORTA = 3000;
app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));