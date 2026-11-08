// CONEXÃO COM O BANCO DE DADOS DE USUARIOS; USADA POR CADASTROUSUARIO
const database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const caminho = path.join(__dirname, 'sbc.sqlite');
const db = new database(caminho); 

const textoLido = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(textoLido);

module.exports = db;