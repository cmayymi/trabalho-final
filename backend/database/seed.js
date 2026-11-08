const db = require('./conexao');
const bcrypt = require('bcryptjs');

const hash_temp = bcrypt.hashSync('v4l#123', 10);

db.prepare('INSERT OR IGNORE INTO Usuario (nome, login, senhaHash) VALUES (?, ?, ?)').run('Valentina', 'valzinha123@hotmail.com', hash_temp);