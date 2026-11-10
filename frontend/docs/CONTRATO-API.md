# Contrato da API

Formato que o frontend espera de cada rota. Serve de referência para implementar o backend.

- Todas as rotas começam com `/api` e usam JSON.
- Exceto `POST /api/login`, todas devem exigir `Authorization: Bearer <token>`.
- Token ausente, inválido ou expirado: responder `401`. O frontend volta para o login.
- Erros: responder `{ "erro": "Mensagem para a usuária." }` com status `400`, `404`, `409` ou `422`.
- Datas no formato `YYYY-MM-DD`. Valores em número, com ponto decimal.

## Autenticação (já existe)

### `POST /api/login`

Corpo: `{ "login": "...", "senha": "..." }`

| Status | Resposta |
| --- | --- |
| 200 | `{ "token": "<jwt>" }` |
| 400 | `{ "erro": "Login e senha são obrigatórios." }` |
| 401 | `{ "erro": "Login ou senha inválidos." }` |

Sugestão: devolver também `"nome"`. Hoje, sem esse campo, o frontend exibe "Betina".

## Catálogo

### Produto

```json
{
  "id": 1,
  "nome": "Bolo de chocolate",
  "categoria": "Bolos",
  "massa": "Chocolate",
  "cobertura": "Brigadeiro",
  "descricao": "Bolo artesanal...",
  "peso": 1.5,
  "precoBase": 120,
  "foto": null,
  "disponibilidade": "DISPONIVEL",
  "fichaTecnica": [
    {
      "insumoId": 1,
      "ingrediente": "Farinha",
      "quantidade": 500,
      "unidade": "g",
      "saldoDisponivel": 12000,
      "status": "OK"
    }
  ]
}
```

- `disponibilidade`: `DISPONIVEL`, `CRITICO` ou `EM_FALTA`.
- `status` do item: `OK`, `CRITICO` (saldo igual ou abaixo do mínimo) ou `FALTA` (saldo menor que a quantidade da ficha).
- `saldoDisponivel`: saldo convertido para a mesma unidade do item da ficha.
- `foto`: `null` ou imagem em data URL/URL.

| Rota | Corpo | Resposta |
| --- | --- | --- |
| `GET /api/produtos` | | Lista de produtos ativos, com `fichaTecnica` |
| `GET /api/produtos/:id` | | Produto |
| `POST /api/produtos` | Campos editáveis | `201` + produto |
| `PUT /api/produtos/:id` | Campos editáveis | Produto |
| `DELETE /api/produtos/:id` | | `204`; não pode apagar vendas antigas (RF11) |

Campos editáveis: `nome`, `categoria`, `massa`, `cobertura`, `descricao`, `peso`, `precoBase`, `foto` e `fichaTecnica` (`insumoId`, `ingrediente`, `quantidade`, `unidade`).

### `GET /api/insumos`

```json
[{ "id": 1, "nome": "Farinha", "saldo": 12, "unidade": "kg", "minimo": 5, "status": "OK" }]
```

`unidade`: `kg`, `l` ou `un`. `status`: `OK` ou `CRITICO`.

## Vendas (já existe no backend: `/api/pedidos`)

Implementado pela Carol na branch `rf02-rf10-schema-pedidos`. O frontend converte os nomes em `src/services/vendas.js`: valores em centavos, peso em gramas e status em minúsculas.

| Rota | Corpo | Resposta |
| --- | --- | --- |
| `GET /api/pedidos` | | Lista de pedidos ativos, do mais recente ao mais antigo |
| `GET /api/pedidos/:id` | | Pedido com seus itens; `404` se não existir |
| `POST /api/pedidos` | Pedido sem `pedidosID` | `201` + pedido salvo |

Corpo do `POST`, como o frontend envia:

```json
{
  "data_pedido": "2026-11-10",
  "cliente_nome": "Maria Silva",
  "cliente_contato": "(45) 99999-0000",
  "descricao": "Cobertura brigadeiro",
  "data_entrega": "2026-11-20",
  "status_pagamento": "pendente",
  "itens": [{ "produtoID": 1, "quantidade": 1, "peso": 1500 }]
}
```

Resposta (o `valor_total` é calculado pelo servidor a partir de `preco_base`):

```json
{
  "pedidosID": 1,
  "data_pedido": "2026-11-10",
  "cliente_nome": "Maria Silva",
  "cliente_contato": "(45) 99999-0000",
  "descricao": "Cobertura brigadeiro",
  "data_entrega": "2026-11-20",
  "status_pagamento": "pendente",
  "valor_total": 12000,
  "situacao": "ativo",
  "itens": [{ "produtoID": 1, "quantidade": 1, "peso": 1500, "preco_unitario": 12000, "custo_unitario": 0, "produto_nome": "Bolo de chocolate" }]
}
```

### Para a venda funcionar com o banco

Os produtos da tela de venda ainda vêm do catálogo de teste do frontend. Por isso a tabela `produtos` precisa ter os mesmos IDs e preços. O script `backend/database/seed-produtos.js` faz isso (`node database/seed-produtos.js`, dentro de `backend`); o SQL equivalente é:

```sql
INSERT OR IGNORE INTO produtos (produtoID, nome, preco_base) VALUES
  (1, 'Bolo de chocolate', 12000),
  (2, 'Bolo de frutas', 9500),
  (3, 'Torta de morango', 11000),
  (4, 'Bolo de cenoura', 8500),
  (5, 'Torta de limão', 9800),
  (6, 'Brigadeiro gourmet (cento)', 18000);
```

Ainda não existe no backend, e por isso o frontend esconde ou avisa:

- Edição de pedidos e troca do status de pagamento (RF10, `PUT`).
- Baixa automática de estoque (UC04).
- Exigência de token nas rotas `/api/pedidos` (o RF05 pede login para qualquer funcionalidade).

## Relatório de vendas

### `GET /api/relatorios/vendas?inicio=2026-09-01&fim=2026-09-30`

```json
{
  "linhas": [
    {
      "pedido": 1042,
      "cliente": "Maria Silva",
      "item": "Bolo de chocolate",
      "data": "2026-09-09",
      "venda": 120,
      "custo": 46,
      "lucro": 74
    }
  ]
}
```

Sem vendas no período: `{ "linhas": [] }`. Os totais são calculados no frontend. Período inválido: `400`.
