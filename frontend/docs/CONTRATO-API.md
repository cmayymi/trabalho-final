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

## Vendas

### Venda

```json
{
  "id": 1042,
  "cliente": "Maria Silva",
  "whatsapp": "(45) 99999-0000",
  "dataPedido": "2026-09-09",
  "produtoId": 1,
  "produto": "Bolo de chocolate",
  "quantidade": 1,
  "peso": 1.5,
  "dataEntrega": "2026-09-12",
  "descricao": "Cobertura brigadeiro",
  "valorTotal": 120,
  "statusPagamento": "Pendente"
}
```

`statusPagamento`: `Pendente` ou `Pago`.

| Rota | Corpo | Resposta |
| --- | --- | --- |
| `GET /api/vendas` | | Lista de vendas, do pedido mais novo ao mais antigo |
| `GET /api/vendas/:id` | | Venda |
| `POST /api/vendas` | Venda sem `id` e `produto` | `201` + venda + `alertasEstoque` |
| `PUT /api/vendas/:id` | Venda sem `id` e `produto` | Venda + `alertasEstoque` |

- A gravação e a baixa de estoque devem ocorrer em uma única transação (UC02 passo 9a, UC04).
- Estoque insuficiente: `409`, sem gravar nada.
- Produto sem ficha técnica: `422`, sem gravar nada.
- `alertasEstoque`: lista de textos dos insumos que ficaram no mínimo ou abaixo, por exemplo `["Chocolate: saldo atual 2 kg"]`. Pode ser vazia.
- Sem troca de produto ou quantidade, o `PUT` não deve alterar o estoque.

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
