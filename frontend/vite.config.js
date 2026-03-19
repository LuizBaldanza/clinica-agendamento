// vite.config.js — Configuração do servidor de desenvolvimento Vue.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // Porta onde o frontend vai rodar
    proxy: {
      // Redireciona chamadas /api para o backend Node.js
      // Assim não precisa escrever o endereço completo em cada chamada
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
