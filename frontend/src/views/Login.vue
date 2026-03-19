<template>
  <!-- ============================================================
    Login.vue — Tela de Login
    ============================================================ -->
  <div class="pagina-auth">
    <div class="card card-auth">
      <!-- Cabeçalho -->
      <div class="auth-header">
        <span class="auth-icone">🏥</span>
        <h1>Bem-vindo</h1>
        <p>Faça login para acessar o sistema</p>
      </div>

      <!-- Mensagem de erro (aparece só se houver erro) -->
      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>

      <!-- Formulário de login -->
      <form @submit.prevent="fazerLogin">
        <!-- @submit.prevent impede o recarregamento da página -->

        <div class="form-grupo">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="seu@email.com"
            required
          />
          <!-- v-model = conecta o input com a variável "form.email" -->
        </div>

        <div class="form-grupo">
          <label for="senha">Senha</label>
          <input
            id="senha"
            v-model="form.senha"
            type="password"
            placeholder="••••••"
            required
          />
        </div>

        <!-- Botão — mostra "Entrando..." enquanto carrega -->
        <button
          type="submit"
          class="btn btn-primario btn-full"
          :disabled="carregando"
        >
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <!-- Link para cadastro -->
      <p class="auth-rodape">
        Não tem conta?
        <RouterLink to="/cadastro">Cadastre-se</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

// "ref" cria variáveis reativas — quando mudam, a tela atualiza
const erro = ref('')           // Mensagem de erro
const carregando = ref(false)  // Estado de carregamento

// Os dados do formulário
const form = ref({
  email: '',
  senha: ''
})

// Função chamada quando o formulário é enviado
async function fazerLogin() {
  erro.value = ''          // Limpa erros anteriores
  carregando.value = true  // Ativa o estado de carregamento

  try {
    await auth.login(form.value.email, form.value.senha)
    router.push('/dashboard')  // Vai para o dashboard após login
  } catch (e) {
    // Pega a mensagem de erro do backend
    erro.value = e.response?.data?.erro || 'Erro ao fazer login. Tente novamente.'
  } finally {
    carregando.value = false  // Sempre desativa o carregamento
  }
}
</script>

<style scoped>
/* "scoped" = esses estilos só afetam ESTE componente */

.pagina-auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
}

.card-auth {
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-icone {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.auth-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--cor-texto);
  margin-bottom: 4px;
}

.auth-header p {
  color: var(--cor-texto-suave);
  font-size: 14px;
}

.btn-full {
  width: 100%;
  justify-content: center;
  padding: 12px;
  font-size: 15px;
  margin-top: 4px;
}

.auth-rodape {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--cor-texto-suave);
}

.auth-rodape a {
  color: var(--cor-primaria);
  font-weight: 500;
  text-decoration: none;
}
</style>
