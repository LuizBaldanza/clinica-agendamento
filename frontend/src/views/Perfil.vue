<template>
  <div class="container" style="max-width: 680px; padding-bottom: 40px;">
    <h1 class="titulo-pagina">👤 Meu Perfil</h1>
    <p class="subtitulo-pagina">Atualize seus dados pessoais e endereço</p>

    <!-- Informações do usuário -->
    <div class="card" style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
        <div class="avatar">{{ iniciais }}</div>
        <div>
          <h2 style="font-size: 18px; font-weight: 600;">{{ auth.usuario?.nome }}</h2>
          <p style="color: var(--cor-texto-suave); font-size: 14px;">{{ auth.usuario?.email }}</p>
          <span :class="auth.eSecretario ? 'badge badge-confirmado' : 'badge badge-agendado'" style="margin-top: 4px; display: inline-block;">
            {{ auth.eSecretario ? '🛠️ Secretário(a)' : '🧑 Paciente' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Formulário de endereço com CEP automático -->
    <div class="card">
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px;">📍 Endereço</h3>

      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>
      <div v-if="sucesso" class="alerta alerta-sucesso">{{ sucesso }}</div>

      <form @submit.prevent="salvarEndereco">

        <!-- Campo CEP com botão de busca automática -->
        <div class="form-grupo">
          <label>CEP</label>
          <div class="cep-grupo">
            <input
              v-model="endereco.cep"
              type="text"
              placeholder="00000-000"
              maxlength="9"
              @input="formatarCep"
            />
            <button
              type="button"
              class="btn btn-outline"
              @click="buscarCep"
              :disabled="buscandoCep || endereco.cep.replace(/\D/g, '').length !== 8"
            >
              {{ buscandoCep ? '...' : '🔍 Buscar' }}
            </button>
          </div>
          <!-- Instrução -->
          <small style="color: var(--cor-texto-suave);">
            Digite o CEP e clique em buscar para preencher o endereço automaticamente.
          </small>
        </div>

        <!-- Campos preenchidos automaticamente pelo CEP -->
        <div class="form-grupo">
          <label>Logradouro (Rua/Avenida)</label>
          <input v-model="endereco.logradouro" type="text" placeholder="Preenchido automaticamente" />
        </div>

        <div class="grid-2">
          <div class="form-grupo">
            <label>Número</label>
            <input v-model="endereco.numero" type="text" placeholder="123" />
          </div>
          <div class="form-grupo">
            <label>Complemento</label>
            <input v-model="endereco.complemento" type="text" placeholder="Apto 45, Bloco B..." />
          </div>
        </div>

        <div class="grid-2">
          <div class="form-grupo">
            <label>Bairro</label>
            <input v-model="endereco.bairro" type="text" placeholder="Preenchido automaticamente" />
          </div>
          <div class="form-grupo">
            <label>Cidade</label>
            <input v-model="endereco.cidade" type="text" placeholder="Preenchido automaticamente" />
          </div>
        </div>

        <div class="form-grupo">
          <label>Estado</label>
          <input v-model="endereco.estado" type="text" maxlength="2" placeholder="SP" style="max-width: 80px;" />
        </div>

        <button type="submit" class="btn btn-primario" :disabled="salvando">
          {{ salvando ? 'Salvando...' : '💾 Salvar Endereço' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const auth = useAuthStore()
const erro = ref('')
const sucesso = ref('')
const buscandoCep = ref(false)
const salvando = ref(false)

// Pega as iniciais do nome para o avatar
const iniciais = computed(() => {
  const nome = auth.usuario?.nome || ''
  return nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
})

// Dados do endereço
const endereco = ref({
  cep: '',
  logradouro: '',
  bairro: '',
  cidade: '',
  estado: '',
  numero: '',
  complemento: ''
})

// Formata o CEP enquanto digita: "01310100" → "01310-100"
function formatarCep() {
  let v = endereco.value.cep.replace(/\D/g, '')
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8)
  endereco.value.cep = v
}

// Busca o endereço na API ViaCEP via nosso backend
async function buscarCep() {
  const cepLimpo = endereco.value.cep.replace(/\D/g, '')
  if (cepLimpo.length !== 8) return

  buscandoCep.value = true
  erro.value = ''

  try {
    const res = await api.get(`/cep/${cepLimpo}`)
    // Preenche os campos automaticamente!
    endereco.value.logradouro = res.data.logradouro
    endereco.value.bairro = res.data.bairro
    endereco.value.cidade = res.data.cidade
    endereco.value.estado = res.data.estado
  } catch (e) {
    erro.value = e.response?.data?.erro || 'CEP não encontrado.'
  } finally {
    buscandoCep.value = false
  }
}

async function salvarEndereco() {
  erro.value = ''
  sucesso.value = ''
  salvando.value = true

  try {
    await api.put('/auth/endereco', endereco.value)
    sucesso.value = '✅ Endereço salvo com sucesso!'
  } catch (e) {
    erro.value = 'Erro ao salvar o endereço.'
  } finally {
    salvando.value = false
  }
}

// Carrega endereço já salvo ao abrir a página
onMounted(async () => {
  try {
    const res = await api.get('/auth/perfil')
    if (res.data.usuario?.endereco) {
      Object.assign(endereco.value, res.data.usuario.endereco)
    }
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.avatar {
  width: 60px;
  height: 60px;
  background: var(--cor-primaria);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
}

.cep-grupo {
  display: flex;
  gap: 8px;
}
.cep-grupo input { flex: 1; }
</style>
