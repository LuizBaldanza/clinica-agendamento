// ============================================================
// router/index.js — Configuração de rotas (navegação entre páginas)
// ============================================================
// O Vue Router controla qual tela aparece para cada URL.
// Ex: quando o usuário acessa /login, mostra a tela de Login.

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Importa as telas (views)
import Login from '../views/Login.vue'
import Cadastro from '../views/Cadastro.vue'
import Dashboard from '../views/Dashboard.vue'
import NovoAgendamento from '../views/NovoAgendamento.vue'
import MeusAgendamentos from '../views/MeusAgendamentos.vue'
import Painel from '../views/Painel.vue'
import Perfil from '../views/Perfil.vue'

// Define as rotas: URL → Componente Vue
const rotas = [
  {
    path: '/',
    redirect: '/dashboard'  // Redireciona a raiz para o dashboard
  },
  {
    path: '/login',
    component: Login,
    meta: { publica: true }  // Não precisa de login
  },
  {
    path: '/cadastro',
    component: Cadastro,
    meta: { publica: true }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requerLogin: true }  // Precisa estar logado
  },
  {
    path: '/agendamento/novo',
    component: NovoAgendamento,
    meta: { requerLogin: true }
  },
  {
    path: '/meus-agendamentos',
    component: MeusAgendamentos,
    meta: { requerLogin: true }
  },
  {
    path: '/painel',
    component: Painel,
    meta: { requerLogin: true, apenasSecretario: true }  // Só secretário
  },
  {
    path: '/perfil',
    component: Perfil,
    meta: { requerLogin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),  // Usa URLs normais (sem #)
  routes: rotas
})

// ============================================================
// GUARDA DE NAVEGAÇÃO — Verifica permissões antes de cada troca de tela
// ============================================================
router.beforeEach((destino) => {
  const auth = useAuthStore()

  // Se a rota precisa de login e o usuário NÃO está logado
  if (destino.meta.requerLogin && !auth.estaLogado) {
    return '/login'  // Redireciona para o login
  }

  // Se a rota é só para secretário e o usuário NÃO é secretário
  if (destino.meta.apenasSecretario && !auth.eSecretario) {
    return '/dashboard'  // Redireciona para o dashboard
  }

  // Se já está logado e tenta acessar login/cadastro
  if (destino.meta.publica && auth.estaLogado) {
    return '/dashboard'
  }
})

export default router
