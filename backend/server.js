require('dotenv').config();         // pega as variaveis do arquivo .env, incluindo o jwt_secret

const express = require('express');
const autenticacao_routes = require('./src/routes/autenticacao-routes');    // importa as rotas criadas
const catalogo_routes = require('./src/routes/catalogo-routes');
const pedidos_routes = require('./src/routes/pedidos-routes');
const relatorios_routes = require('./src/routes/relatorios-routes');

const app = express();

app.use(express.json());                // recebe os dados enviados pelo frontend em json
app.use('/api/pedidos', pedidos_routes);
app.use('/api/relatorios', relatorios_routes);

// ROTAS DA APLICACAO
app.use('/api', autenticacao_routes);   // registra as rotas no servidor, com o endereco completo sendo POST /api/login
app.use('/api', catalogo_routes);

// ROTA DE SAÚDE
app.get('/api/saude', (req, res) => res.json({ ok: true }));            // rota que verifica se o servidor esta funcionando

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));                           