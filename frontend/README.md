# Betina Cozinha: frontend

Interface web do Sistema Betina Cozinha (SBC), feita com **Vue.js 3, Vue CLI, Webpack e Bootstrap 5**.

## Casos de uso implementados

| Caso de uso | Requisito | Onde está |
| --- | --- | --- |
| Autenticar-se no Sistema | RF05 | `src/views/LoginView.vue`, `src/router/index.js` |
| Consultar Catálogo e Aplicar Filtros | RF03, RF11 | `src/views/catalogo/` |
| Registrar Venda | RF02 | `src/views/vendas/` |
| Gerar e Exportar Relatório de Vendas | RF01 | `src/views/relatorios/`, `src/utils/exportacao.js` |

Estoque, configurações, preços e os demais relatórios aparecem no menu como "ainda não disponível".

## Requisitos

- Node.js 20 ou superior para o frontend.
- Node.js 22 ou superior para o backend, por causa do `better-sqlite3` 13.

## Como executar

Dentro da pasta `frontend`:

```bash
npm install
```

```bash
npm run serve
```

Abra `http://localhost:8080`. Nesse modo todos os módulos usam dados de teste, e a tela de login mostra a usuária e a senha de demonstração.

Para testar as mensagens de erro, rode no console do navegador `localStorage.setItem('sbc.mock.falha', '1')`. Para voltar ao normal, use `localStorage.removeItem('sbc.mock.falha')`.

### Com o backend real

Com o backend ligado na porta 3000:

```bash
npm run serve:integracao
```

O login passa a usar `POST /api/login` e o registro de vendas usa `/api/pedidos`, gravando no banco SQLite. Catálogo e relatório seguem com dados de teste.

Para a venda funcionar, a tabela `produtos` do banco precisa ter os produtos do catálogo de teste, com os mesmos IDs. O comando está em [docs/CONTRATO-API.md](docs/CONTRATO-API.md).

### Versão final

```bash
npm run build
```

Os arquivos são gerados em `dist/`.

## Como ligar um módulo ao backend

Quando uma rota ficar pronta seguindo [docs/CONTRATO-API.md](docs/CONTRATO-API.md), troque a variável do módulo para `false` em `.env.integracao`, `.env.development` e `.env.production`. As telas não precisam mudar.

| Variável | Módulo |
| --- | --- |
| `VUE_APP_MOCK_AUTH` | Login |
| `VUE_APP_MOCK_CATALOGO` | Catálogo e insumos |
| `VUE_APP_MOCK_VENDAS` | Vendas |
| `VUE_APP_MOCK_RELATORIOS` | Relatório de vendas |

Por padrão o proxy envia `/api` para `http://localhost:3000`. Para outro endereço, defina a variável de ambiente `BACKEND_URL`.

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

## Funcionalidades por parte

- **Autenticação:** valida os campos, informa credenciais inválidas e servidor indisponível, guarda o token na sessão da aba e protege todas as rotas. Ao expirar, volta para o login.
- **Catálogo:** busca sem diferenciar acentos, filtros por categoria, massa e cobertura, detalhes com ficha técnica, cadastro, edição e exclusão.
- **Vendas:** lista com busca e filtros, registro com validação, cálculo do valor, verificação de ingredientes, resumo para confirmação, consulta e edição.
- **Relatório de vendas:** períodos mensal, semestral, anual e personalizado, totais de venda, custo, lucro e margem, além de PDF, CSV e impressão.
