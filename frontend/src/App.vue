<template>
  <!-- ============================================================
    App.vue — Componente raiz da aplicação
    ============================================================
    Este é o componente "pai" de todos os outros.
    Ele mostra a barra de navegação (quando logado) e o conteúdo
    da página atual via <RouterView />.
  ============================================================ -->

  <div>
    <!-- Barra de navegação — só aparece quando logado -->
    <nav v-if="auth.estaLogado" class="navbar">
      <div class="container navbar-conteudo">
        <!-- Logo -->
        <RouterLink to="/dashboard" class="navbar-logo">
          🏥 Clínica
        </RouterLink>

        <!-- Links de navegação -->
        <div class="navbar-links">
          <RouterLink to="/dashboard">Início</RouterLink>
          <RouterLink to="/agendamento/novo">Agendar</RouterLink>
          <RouterLink to="/meus-agendamentos">Minhas Consultas</RouterLink>
          <!-- Painel só aparece para secretários -->
          <RouterLink v-if="auth.eSecretario" to="/painel">Painel Admin</RouterLink>
          <RouterLink to="/perfil">Perfil</RouterLink>
          <button @click="sair" class="btn-sair">Sair</button>
        </div>
      </div>
    </nav>

    <!-- Conteúdo da página atual (troca conforme a rota) -->
    <main :class="{ 'com-navbar': auth.estaLogado }">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
// <script setup> é o jeito moderno de escrever Vue 3
// É como a parte "JavaScript" do componente

import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()    // Acessa o estado global de autenticação
const router = useRouter()     // Controla a navegação

// Função de logout
function sair() {
  auth.logout()                // Limpa os dados de autenticação
  router.push('/login')        // Vai para a tela de login
}
</script>

<style>
/* Estilos da barra de navegação */
.navbar {
  background: white;
  border-bottom: 1px solid var(--cor-borda);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--sombra);
}

.navbar-conteudo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.navbar-logo {
  font-size: 18px;
  font-weight: 700;
  color: var(--cor-primaria);
  text-decoration: none;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-links a {
  padding: 6px 12px;
  border-radius: var(--raio);
  text-decoration: none;
  color: var(--cor-texto-suave);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.navbar-links a:hover,
.navbar-links a.router-link-active {
  color: var(--cor-primaria);
  background: #eff6ff;
}

.btn-sair {
  padding: 6px 12px;
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio);
  background: white;
  color: var(--cor-perigo);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-sair:hover { background: #fef2f2; }

/* Empurra o conteúdo para baixo da navbar */
.com-navbar {
  padding-top: 20px;
}
</style>
