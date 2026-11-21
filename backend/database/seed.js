const db = require('./conexao');
const bcrypt = require('bcryptjs');

const hash_temp = bcrypt.hashSync('s3nhA!', 10);

db.prepare('INSERT OR IGNORE INTO Usuario (nome, login, senhaHash) VALUES (?, ?, ?)').run('Lula', 'brilha_umaestrela@gmail.com', hash_temp);

const insereCatalogo = db.transaction(() => {
    const novoIngred = db.prepare(`INSERT INTO Ingrediente (nome, unidadeMedida, quantidadeEstoque, estoqueMinimo, valorUltimaCompra, quantidadeUltimaCompra, dataUltimaCompra) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const novaFicha = db.prepare('INSERT INTO FichaTecnica DEFAULT VALUES');
        const novoProd = db.prepare('INSERT INTO Produto (nome, descricao, preco, fichaId, tipo_venda) VALUES (?, ?, ?, ?, ?)');
    const novoItem = db.prepare('INSERT INTO ItemFicha (fichaId, ingredienteId, quantidade) VALUES (?, ?, ?)');

    // teste de insercao de ingredientes
    const leiteCondensado = novoIngred.run('Leite condensado', 'g', 5000, 1000, 790, 395, '2026-11-01').lastInsertRowid;
    const chocolate = novoIngred.run('Chocolate em pó', 'g', 2000, 5000, 800, 300, '2026-10-05').lastInsertRowid;

    // teste de ficha, produto e itens
    const fichaBrigadeiro = novaFicha.run().lastInsertRowid;
    novoProd.run('Brigadeiro', 'Brigadeiro tradicional', 350, fichaBrigadeiro, 'unidade');
    novoItem.run(fichaBrigadeiro, leiteCondensado, 10);
    novoItem.run(fichaBrigadeiro, chocolate, 5);

    const coco = novoIngred.run('Coco ralado desidratado', 'g', 0, 1000, 300, 200, '2026-08-20').lastInsertRowid;

    // teste de ficha, produto e itens
    const fichaBeijinho = novaFicha.run().lastInsertRowid;
    novoProd.run('Beijinho', 'Beijinho tradicional', 250, fichaBeijinho, 'unidade');
    novoItem.run(fichaBeijinho, leiteCondensado, 10);
    novoItem.run(fichaBeijinho, coco, 15);

    // bolo vendido por peso: preço e ficha valem por 1 kg
    const farinha = novoIngred.run('Farinha de trigo', 'g', 10000, 2000, 500, 1000, '2026-11-05').lastInsertRowid;

    const fichaBolo = novaFicha.run().lastInsertRowid;
    novoProd.run('Bolo de chocolate', 'Bolo de chocolate (preço por kg)', 8000, fichaBolo, 'peso');
    novoItem.run(fichaBolo, leiteCondensado, 200);
    novoItem.run(fichaBolo, chocolate, 150);
    novoItem.run(fichaBolo, farinha, 500);
});

if (db.prepare('SELECT COUNT(*) AS n FROM Produto').get().n === 0) {
    insereCatalogo();
    console.log('Seed do catálogo concluído');
}