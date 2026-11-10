// CADASTRA OS PRODUTOS DE TESTE USADOS PELA TELA DE REGISTRO DE VENDAS
// os IDs e precos sao os mesmos do catalogo de teste do frontend (frontend/src/services/mock/dados.js)
// pode ser executado mais de uma vez: produtos ja cadastrados sao ignorados
// uso: node database/seed-produtos.js

const db = require('./conexao');

const produtos = [
    // [produtoID, nome, preco_base em centavos]
    [1, 'Bolo de chocolate', 12000],
    [2, 'Bolo de frutas', 9500],
    [3, 'Torta de morango', 11000],
    [4, 'Bolo de cenoura', 8500],
    [5, 'Torta de limão', 9800],
    [6, 'Brigadeiro gourmet (cento)', 18000],
];

const inserir = db.prepare('INSERT OR IGNORE INTO produtos (produtoID, nome, preco_base) VALUES (?, ?, ?)');

// tudo ou nada: se um insert falhar, nenhum produto e gravado
const cadastrarTodos = db.transaction(() => {
    let novos = 0;
    produtos.forEach((produto) => {
        novos += inserir.run(...produto).changes;
    });
    return novos;
});

const novos = cadastrarTodos();
console.log(`Produtos cadastrados: ${novos} novos, ${produtos.length - novos} ja existiam.`);
