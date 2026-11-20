backend/
├── database/
│   ├── conexao.js            # abre o banco e executa o schema.sql
│   ├── schema.sql            # criação das tabelas e índices
│   └── sbc.sqlite            # arquivo do banco (gerado automaticamente)
├── src/
│   ├── models/
│   │   ├── pedido.js             # entidade Pedido
│   │   └── cadastro-pedido.js    # coleção CadastroPedido
│   ├── controllers/
│   │   └── controle-pedidos.js   # controle ControlePedidos
│   └── routes/
│       └── pedidos-routes.js     # rotas de /api/pedidos
├── server.js                 # inicia o Express e registra as rotas
└── package.json