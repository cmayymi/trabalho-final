# Betina Cozinha: frontend

Interface web do Sistema Betina Cozinha (SBC), feita com **Vue.js 3, Vue CLI, Webpack e Bootstrap 5**.

## Casos de uso implementados (ligados ao backend)

| Caso de uso | Requisitos | Telas (boundary) | Rotas do backend |
| --- | --- | --- | --- |
| UC6 Autenticar-se no Sistema | RF05 | `LoginView.vue` (TelaAutenticacao) | `POST /api/login` |
| UC9 Consultar Catálogo | RF03, RF04 (disponibilidade), RF07 (preço) | `CatalogoView.vue` (TelaCatalogo), `ProdutoDetalheView.vue` (TelaDetalheProduto) | `GET /api/produtos`, `GET /api/produtos/:id` |
| UC2 Registrar Venda | RF02, RF07, RF08 (custo gravado na venda) | `VendaFormView.vue`, `VendasView.vue`, `VendaDetalheView.vue` | `POST`, `GET /api/pedidos` |
| UC1 Gerar Relatório de Vendas | RF01, RF08, RF09 (custo, lucro e margem) | `RelatorioVendasView.vue` | `GET /api/relatorios/vendas` |

## Funcionalidades extras ligadas ao backend

| Funcionalidade | Requisito | Telas | Rotas do backend |
| --- | --- | --- | --- |
| Editar pedido, marcar como pago e excluir pedido | RF10 | `VendaFormView.vue`, `VendasView.vue`, `VendaDetalheView.vue` | `PUT`, `DELETE /api/pedidos/:id` |
| Relatório de estoque e alertas de estoque crítico | RF01, RF04 | `RelatorioEstoqueView.vue`, `InicioView.vue` | `GET /api/relatorios/estoque` |
| Relatório de lucro e histórico de apurações | RF09, RF08 | `RelatorioLucroView.vue` | `POST /api/relatorios/lucro`, `GET /api/relatorios/lucro/historico` |
| Gerenciar Produto (extensão do UC9): cadastrar, editar e excluir produto com a ficha técnica | RF03 | `ProdutoFormView.vue`, `CatalogoView.vue`, `ProdutoDetalheView.vue` | `GET /api/ingredientes`, `POST /api/produtos`, `PUT` e `DELETE /api/produtos/:id` |

## Em desenvolvimento

Estas telas existem no protótipo, mas o backend ainda não tem as rotas. No site, elas abrem uma página "Em desenvolvimento":

- Gerenciar preços (RF07)
- Controle de estoque e movimentações (RF04, RF12)
- Custos e margens (tela própria do RF08)
- Configurações e alteração de senha (RF05)
- Importar pedido do WhatsApp (RF06)

## Requisitos

- Node.js 22 ou superior.

## Como executar

Dentro da pasta `frontend`:

```bash
npm install
```

### Com o backend (modo usado na entrega)

Com o backend ligado na porta 3000 (veja o README da raiz):

```bash
npm run serve:integracao
```

Abra `http://localhost:8080` e entre com a usuária cadastrada em `backend/database/seed.js`.

### Modo demonstração (sem backend)

```bash
npm run serve
```

Todos os dados são de teste e guardados no navegador. O login é `betina`, com a senha `betina123`. Para testar as mensagens de erro, rode no console do navegador `localStorage.setItem('sbc.mock.falha', '1')`; para voltar ao normal, `localStorage.removeItem('sbc.mock.falha')`.

### Versão final

```bash
npm run build
```

Os arquivos são gerados em `dist/`.

## Configuração dos módulos

Os arquivos `.env.*` definem, módulo a módulo, se o site usa dados de teste (`true`) ou o backend (`false`):

| Variável | Módulo | `.env.integracao` |
| --- | --- | --- |
| `VUE_APP_MOCK_AUTH` | Login | `false` |
| `VUE_APP_MOCK_CATALOGO` | Catálogo | `false` |
| `VUE_APP_MOCK_VENDAS` | Vendas | `false` |
| `VUE_APP_MOCK_RELATORIOS` | Relatórios | `false` |

O proxy envia `/api` para `http://localhost:3000`. Para outro endereço, defina a variável de ambiente `BACKEND_URL`.

## Conversões feitas pelo frontend

O backend guarda os valores em centavos e o peso em gramas. A pasta `src/services/` converte para reais e quilos:

- `catalogo.js`: preço do produto e ficha técnica. No cadastro, o formulário envia só os campos que o banco tem (nome, descrição, preço em centavos, `tipoVenda` e os ingredientes da ficha); categoria, massa, cobertura, peso padrão e foto aparecem só no modo demonstração. Produtos com `tipoVenda` igual a `peso` (como bolos) têm preço e ficha por kg; os demais, por unidade.
- `vendas.js`: cada item é enviado com o `id` do produto, a quantidade e, para produtos por peso, o peso de cada item em gramas.
- `relatorios.js`: valores de venda, custo, lucro e custo médio dos insumos.

## Estrutura

```text
src/
  assets/       logos e tema visual
  components/   comum/, layout/ e catalogo/
  composables/  sessão da usuária e mensagens rápidas
  router/       rotas e proteção de acesso
  services/     comunicação com a API e dados de teste (mock/)
  utils/        formatação e exportação de PDF e CSV
  views/        telas do sistema
```
