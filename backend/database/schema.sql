-- BANCO DE DADOS DE USUARIOS EXISTENTES E NECESSARIOS PARA O SISTEMA
CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    login TEXT UNIQUE NOT NULL COLLATE NOCASE,          -- aceita Fulano e fulano
    senhaHash TEXT NOT NULL
);

-- teste da tabela
CREATE TABLE IF NOT EXISTS produtos (
    produtoID INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco_base INTEGER NOT NULL -- em centavos
);

CREATE TABLE IF NOT EXISTS pedidos (
    pedidosID INTEGER PRIMARY KEY AUTOINCREMENT,
    data_pedido TEXT NOT NULL,
    cliente_nome TEXT NOT NULL,
    cliente_contato TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data_entrega TEXT NOT NULL,
    status_pagamento TEXT NOT NULL CHECK(status_pagamento IN ('pendente', 'pago')),
    valor_total INTEGER NOT NULL CHECK(valor_total >= 0), -- valor_total é integer pq em real é arredondado, então é melhor armazenar em centavos
    situacao TEXT NOT NULL DEFAULT 'ativo' CHECK(situacao IN ('ativo', 'excluido'))
);

CREATE TABLE IF NOT EXISTS itens_pedido (
    itens_pedidoID INTEGER PRIMARY KEY AUTOINCREMENT,
    pedidosID INTEGER NOT NULL,
    produtoID INTEGER NOT NULL,
    quantidade INTEGER NOT NULL CHECK(quantidade > 0),
    peso INTEGER NOT NULL, -- unidade em gramas
    preco_unitario INTEGER NOT NULL CHECK(preco_unitario >= 0), -- em centavos
    custo_unitario INTEGER NOT NULL CHECK(custo_unitario >= 0), -- em centavos
    FOREIGN KEY (pedidosID) REFERENCES pedidos(pedidosID),
    FOREIGN KEY (produtoID) REFERENCES produtos(produtoID)
);

CREATE TABLE IF NOT EXISTS historico_pedidos (
    historicoID INTEGER PRIMARY KEY AUTOINCREMENT,
    pedidosID INTEGER NOT NULL,
    tipo_operacao TEXT NOT NULL CHECK(tipo_operacao IN ('edicao', 'exclusao')),
    dados_anteriores TEXT NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY (pedidosID) REFERENCES pedidos(pedidosID)
);

CREATE INDEX IF NOT EXISTS idx_pedidos_situacao_data ON pedidos(situacao, data_pedido);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedidosID ON itens_pedido(pedidosID);