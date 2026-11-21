// abre o arquivo .db uma única vez e exporta essa conexão
// todos os outros arquivos importam a mesma, nunca abrem uma nova

// importa a biblioteca better-sqlite3
const database = require('better-sqlite3');

// importa o modulo path
const path = require('path');

// modulo fs para ler o conteudo
const fs = require('fs');

// define o caminho
const caminho = path.join(__dirname, 'sbc.sqlite');

// cria a conexão com o banco de dados
const db = new database(caminho);

// foreign keys vem desligadas por padrão no SQLite, então precisamos ativar manualmente
db.pragma('foreign_keys = ON');

// monta o caminho do schema.sql
// le o conteúdo do arquivo com utf8 para retornar uma string 
const textoLido = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// passa o texto lido para o db.exec criar as tabelas
db.exec(textoLido);

// pra n ter q ficar apagando tod ahora o sbc.sqlite, por cont ados ingredientes
const colunasIngrediente = db.prepare('PRAGMA table_info(Ingrediente)').all().map((c) => c.name);
if (!colunasIngrediente.includes('estoqueMinimo')) {
    db.exec('ALTER TABLE Ingrediente ADD COLUMN estoqueMinimo REAL NOT NULL DEFAULT 0');
}
if (!colunasIngrediente.includes('custoUltimaCompra')) {
    db.exec('ALTER TABLE Ingrediente ADD COLUMN custoUltimaCompra INTEGER NOT NULL DEFAULT 0');
}

// exporta a conexão pronta para ser usada nos outros arquivos
module.exports = db;
