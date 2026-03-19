<template>
  <div class="pagina-auth">
    <div class="card card-auth">
      <div class="auth-header">
        <span class="auth-icone">📋</span>
        <h1>Criar Conta</h1>
        <p>Preencha os dados para se cadastrar</p>
      </div>

      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>
      <div v-if="sucesso" class="alerta alerta-sucesso">{{ sucesso }}</div>

      <form @submit.prevent="fazerCadastro">
        <div class="form-grupo">
          <label>Nome completo</label>
          <input v-model="form.nome" type="text" placeholder="João da Silva" required />
        </div>

        <div class="form-grupo">
          <label>E-mail</label>
          <input v-model="form.email" type="email" placeholder="seu@email.com" required />
        </div>

        <div class="form-grupo">
          <label>Telefone</label>
          <input v-model="form.telefone" type="tel" placeholder="(11) 99999-9999" />
        </div>

        <div class="form-grupo">
          <label>Tipo de conta</label>
          <select v-model="form.perfil">
            <option value="paciente">Paciente</option>
            <option value="secretario">Secretário(a)</option>
          </select>
        </div>

        <div class="form-grupo">
          <label>Senha</label>
          <input v-model="form.senha" type="password" placeholder="Mínimo 6 caracteres" required minlength="6" />
        </div>

        <div class="form-grupo">
          <label>Confirmar senha</label>
          <input v-model="form.confirmarSenha" type="password" placeholder="Repita a senha" required />
        </div>

        <button type="submit" class="btn btn-primario btn-full" :disabled="carregando">
          {{ carregando ? 'Cadastrando...' : 'Criar Conta' }}
        </button>
      </form>

      <p class="auth-rodape">
        Já tem conta?
        <RouterLink to="/login">Faça login</RouterLink>
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

const erro = ref('')
const sucesso = ref('')
const carregando = ref(false)

const form = ref({
  nome: '',
  email: '',
  telefone: '',
  perfil: 'paciente',
  senha: '',
  confirmarSenha: ''
})

async function fazerCadastro() {
  erro.value = ''
  sucesso.value = ''

  // Validação no frontend
  if (form.value.senha !== form.value.confirmarSenha) {
    erro.value = 'As senhas não coincidem.'
    return
  }

  carregando.value = true

  try {
    await auth.cadastrar({
      nome: form.value.nome,
      email: form.value.email,
      telefone: form.value.telefone,
      perfil: form.value.perfil,
      senha: form.value.senha
    })
    router.push('/dashboard')
  } catch (e) {
    erro.value = e.response?.data?.erro || 'Erro ao cadastrar. Tente novamente.'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.pagina-auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
}
.card-auth { width: 100%; max-width: 440px; }
.auth-header { text-align: center; margin-bottom: 24px; }
.auth-icone { font-size: 48px; display: block; margin-bottom: 12px; }
.auth-header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.auth-header p { color: var(--cor-texto-suave); font-size: 14px; }
.btn-full { width: 100%; justify-content: center; padding: 12px; font-size: 15px; }
.auth-rodape { text-align: center; margin-top: 20px; font-size: 14px; color: var(--cor-texto-suave); }
.auth-rodape a { color: var(--cor-primaria); font-weight: 500; text-decoration: none; }
</style>
