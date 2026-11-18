// CONEXÃO COM O BANCO DE DADOS DE USUARIOS; USADA POR CADASTROUSUARIO
const database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');                               // monta caminhos de arquivos

const caminho = path.join(__dirname, 'sbc.sqlite');         // abre o banco de dados
const db = new database(caminho); 
  db.pragma('foreign_keys = ON');                           // ativa para chaves estrangeiras

const pasta_schema = path.join(__dirname, 'schema');        // linhas 10 a 14 descobrem os esquemas

const arq = fs.readdirSync(pasta_schema)                        // lista os arquivos usuario.sql e catalogo.sql
    .filter(nome => nome.endsWith('.sql'))              // pega os nomes que terminam com .sql
    .sort();                                                // organiza em ordem alfabetica

for (const nome of arq) {                               // para cada arquivo lido, executa o esquema
    const textoLido = fs.readFileSync(path.join(pasta_schema, nome), 'utf8');
    db.exec(textoLido);
}    

module.exports = db;