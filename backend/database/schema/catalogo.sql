-- UC 9: Consultar catalogo
CREATE TABLE IF NOT EXISTS Ingrediente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    unidadeMedida TEXT NOT NULL,
    quantidadeEstoque REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS FichaTecnica (
    id INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE IF NOT EXISTS Produto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL,
    fichaId INTEGER NOT NULL UNIQUE,                        -- todo produto tem uma unica ficha, ou seja, nao pode haver uma ficha compartilhada por dois ou mais produtos
    FOREIGN KEY (fichaId) REFERENCES FichaTecnica(id)       -- guarda a associacao do diagrama com Produto -> FichaTecnica, armazenando a chave 
);

CREATE TABLE IF NOT EXISTS ItemFicha (
    fichaId INTEGER NOT NULL,                   -- diz a qual ficha o item pertence
    ingredienteId INTEGER NOT NULL,             -- qual eh o ingrediente utilizado para aquele produto
    quantidade REAL NOT NULL,                   -- quantidade do ingrediente que eh utilizada naquele produto (pode variar de receita para receita)
    PRIMARY KEY (fichaId, ingredienteId),
    FOREIGN KEY (fichaId) REFERENCES FichaTecnica(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredienteId) REFERENCES Ingrediente(id)
);