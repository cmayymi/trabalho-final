# Contrato da API

Rotas do backend usadas pelo frontend, no formato em que o backend responde. As conversões para as telas ficam em `src/services/`.

- Todas as rotas começam com `/api` e usam JSON.
- O frontend envia `Authorization: Bearer <token>` em todas as chamadas depois do login.
- Valores em dinheiro são inteiros em **centavos**; pesos são inteiros em **gramas**; datas são `AAAA-MM-DD`.
- Erros: `{ "erro": "Mensagem para a usuária." }`, com status `400`, `401`, `404` ou `500`.

## Autenticação (UC6, RF05)

### `POST /api/login`

Corpo: `{ "login": "...", "senha": "..." }` → `200 { "token": "<jwt>" }`, `400` (campos vazios) ou `401` (credenciais inválidas).

## Catálogo (UC9, RF03)

### `GET /api/produtos`

```json
[
  {
    "id": 3,
    "nome": "Bolo de chocolate",
    "descricao": "Bolo de chocolate (preço por kg)",
    "preco": 8000,
    "tipoVenda": "peso",
    "ficha": {
      "itens": [
        { "quantidade": 500, "ingrediente": { "id": 4, "nome": "Farinha de trigo", "unidadeMedida": "g", "quantidadeEstoque": 10000 } }
      ]
    }
  }
]
```

- `tipoVenda`: `unidade` (preço de 1 unidade) ou `peso` (preço e ficha técnica de 1 kg).

### `GET /api/produtos/:id`

`{ "produto": { ...igual ao item acima }, "ficha": { "itens": [...] }, "ingredientesDisp": true }`

### Gerenciar Produto (extensão do UC9)

| Rota | Descrição |
| --- | --- |
| `GET /api/ingredientes` | Lista `{ id, nome, unidadeMedida, quantidadeEstoque, estoqueMinimo, ... }` para montar a ficha técnica |
| `POST /api/produtos` | Cadastra; responde `201 { mensagem }` (sem o `id`: o frontend procura o produto novo pelo nome) |
| `PUT /api/produtos/:id` | Atualiza o produto e troca os itens da ficha |
| `DELETE /api/produtos/:id` | Exclui; responde `409` se o produto já tiver vendas |

Corpo de `POST` e `PUT`:

```json
{ "nome": "Bolo de cenoura", "descricao": "...", "preco": 7000, "tipoVenda": "peso",
  "ingredientes": [{ "ingredienteId": 4, "quantidade": 300 }] }
```

- `preco` em centavos. `quantidade` na unidade do ingrediente, para 1 unidade ou 1 kg do produto, conforme `tipoVenda`.

## Vendas (UC2, RF02 e RF10)

| Rota | Descrição |
| --- | --- |
| `GET /api/pedidos` | Lista os pedidos ativos |
| `GET /api/pedidos/:id` | Detalha um pedido |
| `POST /api/pedidos` | Registra uma venda (`201`) |
| `PUT /api/pedidos/:id` | Edita um pedido (RF10) |
| `DELETE /api/pedidos/:id` | Exclusão lógica do pedido (`204`, RF10) |

Corpo de `POST` e `PUT`:

```json
{
  "data_pedido": "2026-11-22",
  "cliente_nome": "Maria Silva",
  "cliente_contato": "(45) 99999-0000",
  "descricao": "",
  "data_entrega": "2026-11-30",
  "status_pagamento": "pendente",
  "itens": [{ "id": 3, "quantidade": 2, "peso": 1500 }]
}
```

- `itens[].id` é o `id` do produto do catálogo. `peso` (gramas de cada item) é obrigatório só para produtos por peso; para produtos por unidade, envie `0`.
- O backend calcula `preco_unitario`, `custo_unitario` (RF08) e `valor_total` pelos dados do catálogo.

Resposta de um pedido:

```json
{
  "pedidosID": 2,
  "data_pedido": "2026-11-22",
  "cliente_nome": "Maria Silva",
  "cliente_contato": "(45) 99999-0000",
  "descricao": "",
  "data_entrega": "2026-11-30",
  "status_pagamento": "pendente",
  "valor_total": 24000,
  "situacao": "ativo",
  "itens": [{ "id": 3, "produtoID": 3, "produto_nome": "Bolo de chocolate", "quantidade": 2, "peso": 1500, "preco_unitario": 12000, "custo_unitario": 1575 }]
}
```

## Relatórios (UC1, RF01, RF08 e RF09)

| Rota | Resposta |
| --- | --- |
| `GET /api/relatorios/vendas?inicio=&fim=` | `{ "linhas": [{ "pedido", "cliente", "item", "data", "venda", "custo", "lucro" }] }` |
| `GET /api/relatorios/estoque` | `{ "linhas": [{ "insumo", "unidade", "estoque_atual", "estoque_minimo", "custo_unitario", "valor_ultima_compra", "quantidade_ultima_compra", "data_ultima_compra", "abaixo_do_minimo", "sem_custo" }] }` |
| `POST /api/relatorios/lucro` (corpo `{ "inicio", "fim" }`) | Apuração gravada: `{ "id", "inicio", "fim", "data_apuracao", "faturamento", "custo_total", "lucro", "margem", "produtos": [...] }` |
| `GET /api/relatorios/lucro/historico` | `{ "apuracoes": [ ...apurações ] }` |

## Ainda não existe no backend

- Rotas de preços (RF07), de movimentações de estoque (RF12) e de alteração de senha.
- Exigência de token nas rotas `/api/pedidos` e `/api/relatorios`.
