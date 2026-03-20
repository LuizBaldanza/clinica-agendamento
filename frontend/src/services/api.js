// ============================================================
// services/api.js — Configuração centralizada do Axios
// ============================================================
// Axios é a biblioteca que faz as chamadas HTTP para o backend.
// Aqui configuramos ela uma vez e usamos em todo o projeto.

import axios from 'axios'

// Cria uma instância do Axios com configurações padrão
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api',
  timeout: 10000,   // Tempo máximo de espera: 10 segundos
})

// ============================================================
// INTERCEPTOR DE REQUISIÇÃO
// Roda antes de TODA requisição ser enviada
// ============================================================
api.interceptors.request.use((config) => {
  // Pega o token salvo no navegador (localStorage)
  const token = localStorage.getItem('token')
  
  // Se existe um token, adiciona no cabeçalho da requisição
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

// ============================================================
// INTERCEPTOR DE RESPOSTA
// Roda quando chega uma resposta do servidor
// ============================================================
api.interceptors.response.use(
  // Resposta OK: simplesmente retorna
  (response) => response,
  
  // Erro: trata casos especiais
  (error) => {
    // Se o token expirou ou é inválido (erro 401)
    if (error.response?.status === 401) {
      // Remove o token inválido
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      // Redireciona para o login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
