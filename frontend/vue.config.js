const { defineConfig } = require('@vue/cli-service')

// O proxy faz o navegador enxergar frontend (8080) e backend (3000) como um só
// endereço durante o desenvolvimento: toda chamada a /api vai para o Express.
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
