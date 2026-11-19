const db = require('./conexao');
const bcrypt = require('bcryptjs');

const hash_temp = bcrypt.hashSync('s3nhA!', 10);

db.prepare('INSERT OR IGNORE INTO Usuario (nome, login, senhaHash) VALUES (?, ?, ?)').run('Lula', 'brilha_umaestrela@gmail.com', hash_temp);

const insereCatalogo = db.transaction(() => {
    const novoIngred = db.prepare('INSERT INTO Ingrediente (nome, unidadeMedida, quantidadeEstoque) VALUES (?, ?, ?)');
    const novaFicha = db.prepare('INSERT INTO FichaTecnica DEFAULT VALUES');
    const novoProd = db.prepare('INSERT INTO Produto (nome, descricao, preco, fichaId) VALUES (?, ?, ?, ?)');
    const novoItem = db.prepare('INSERT INTO ItemFicha (fichaId, ingredienteId, quantidade) VALUES (?, ?, ?)');

    // teste de insercao de ingredientes
    const leiteCondensado = novoIngred.run('Leite condensado', 'g', 5000).lastInsertRowid;
    const chocolate = novoIngred.run('Chocolate em pó', 'g', 2000).lastInsertRowid;

    // teste de ficha, produto e itens
    const fichaBrigadeiro = novaFicha.run().lastInsertRowid;
    novoProd.run('Brigadeiro', 'Brigadeiro tradicional', 3.5, fichaBrigadeiro);
    novoItem.run(fichaBrigadeiro, leiteCondensado, 10);
    novoItem.run(fichaBrigadeiro, chocolate, 5);

    const coco = novoIngred.run('Coco ralado desidratado', 'g', 0).lastInsertRowid;

    // teste de ficha, produto e itens
    const fichaBeijinho = novaFicha.run().lastInsertRowid;
    novoProd.run('Beijinho', 'Beijinho tradicional', 2.5, fichaBeijinho);
    novoItem.run(fichaBeijinho, leiteCondensado, 10);
    novoItem.run(fichaBeijinho, coco, 15);
});

if (db.prepare('SELECT COUNT(*) AS n FROM Produto').get().n === 0) {
    insereCatalogo();
    console.log('Seed do catálogo concluído');
}