// CONEXÃO COM O BANCO DE DADOS DE USUARIOS; USADA POR CADASTROUSUARIO
const database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');                               // monta caminhos de arquivos

const caminho = path.join(__dirname, 'sbc.sqlite');         // abre o banco de dados
const db = new database(caminho); 
db.pragma('foreign_keys = ON');                           // ativa para chaves estrangeiras

const caminho_schema = path.join(__dirname, 'schema.sql');        // cobre o esquema criado
const textoLido = fs.readFileSync(caminho_schema, 'utf8');          // le o schema unificado

db.exec(textoLido);         // executa o schema

module.exports = db;        // exporta a conexao