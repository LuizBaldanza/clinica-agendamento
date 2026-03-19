// ============================================================
// main.js — Ponto de entrada do Vue.js
// ============================================================
// Aqui "ligamos" o Vue e configuramos os plugins (extras)

import { createApp } from 'vue'
import { createPinia } from 'pinia'  // Gerenciador de estado (dados globais)
import App from './App.vue'
import router from './router'
import './assets/style.css'          // Nosso CSS global

const app = createApp(App)  // Cria a aplicação Vue

app.use(createPinia())       // Ativa o Pinia (guarda dados entre telas)
app.use(router)              // Ativa o Vue Router (navegação entre páginas)

app.mount('#app')            // "Monta" o Vue no elemento #app do HTML
