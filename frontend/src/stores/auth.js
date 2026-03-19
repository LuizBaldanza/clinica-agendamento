// ============================================================
// stores/auth.js — Gerenciador de estado de autenticação
// ============================================================
// Pinia é como uma "memória global" do Vue.
// Qualquer tela pode ler ou alterar esses dados.
// Aqui guardamos: quem está logado, o token JWT, etc.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // ============================================================
  // ESTADO — Os dados que queremos guardar globalmente
  // ============================================================
  
  // Tenta recuperar dados salvos no navegador (caso o usuário já estava logado)
  const token = ref(localStorage.getItem('token') || null)
  const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))

  // ============================================================
  // GETTERS — Dados calculados a partir do estado
  // ============================================================
  
  // Retorna true se o usuário está logado
  const estaLogado = computed(() => !!token.value)
  
  // Retorna true se o usuário é secretário
  const eSecretario = computed(() => usuario.value?.perfil === 'secretario')

  // ============================================================
  // AÇÕES — Funções que mudam o estado
  // ============================================================

  // Realiza o login
  async function login(email, senha) {
    const resposta = await api.post('/auth/login', { email, senha })
    
    // Salva o token e os dados do usuário
    token.value = resposta.data.token
    usuario.value = resposta.data.usuario
    
    // Salva no localStorage para persistir após fechar o navegador
    localStorage.setItem('token', resposta.data.token)
    localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario))
    
    return resposta.data
  }

  // Realiza o cadastro
  async function cadastrar(dados) {
    const resposta = await api.post('/auth/cadastro', dados)
    
    token.value = resposta.data.token
    usuario.value = resposta.data.usuario
    
    localStorage.setItem('token', resposta.data.token)
    localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario))
    
    return resposta.data
  }

  // Realiza o logout
  function logout() {
    token.value = null
    usuario.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  return {
    token, usuario,
    estaLogado, eSecretario,
    login, cadastrar, logout
  }
})
