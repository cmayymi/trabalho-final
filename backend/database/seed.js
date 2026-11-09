const db = require('./conexao');
const bcrypt = require('bcryptjs');

const hash_temp = bcrypt.hashSync('s3nhA!', 10);

db.prepare('INSERT OR IGNORE INTO Usuario (nome, login, senhaHash) VALUES (?, ?, ?)').run('Betina', 'betinadalcol26@gmail.com', hash_temp);