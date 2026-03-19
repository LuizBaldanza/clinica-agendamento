<template>
  <div class="container" style="max-width: 680px; padding-bottom: 40px;">
    <h1 class="titulo-pagina">📅 Agendar Consulta</h1>
    <p class="subtitulo-pagina">Preencha os dados para marcar sua consulta</p>

    <div class="card">
      <!-- Alertas -->
      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>
      <div v-if="sucesso" class="alerta alerta-sucesso">{{ sucesso }}</div>
      <div v-if="avisoClima" class="alerta alerta-aviso">{{ avisoClima }}</div>

      <form @submit.prevent="agendar">

        <!-- Médico e Especialidade -->
        <div class="grid-2">
          <div class="form-grupo">
            <label>Médico(a)</label>
            <input v-model="form.medico" type="text" placeholder="Ex: Dr. João Silva" required />
          </div>

          <div class="form-grupo">
            <label>Especialidade</label>
            <select v-model="form.especialidade" required>
              <option value="">Selecione...</option>
              <option>Clínico Geral</option>
              <option>Cardiologia</option>
              <option>Dermatologia</option>
              <option>Ortopedia</option>
              <option>Pediatria</option>
              <option>Ginecologia</option>
              <option>Oftalmologia</option>
              <option>Neurologia</option>
              <option>Psiquiatria</option>
              <option>Urologia</option>
            </select>
          </div>
        </div>

        <!-- Data e Hora -->
        <div class="form-grupo">
          <label>Data e Hora da Consulta</label>
          <input
            v-model="form.dataHora"
            type="datetime-local"
            :min="dataMinima"
            required
            @change="verificarClima"
          />
          <!-- @change = executa quando o usuário muda a data -->
        </div>

        <!-- Indicador de clima -->
        <div v-if="verificandoClima" class="alerta alerta-info">
          🔍 Verificando previsão do tempo para este dia...
        </div>

        <!-- Observações -->
        <div class="form-grupo">
          <label>Observações (opcional)</label>
          <textarea
            v-model="form.observacoes"
            rows="3"
            placeholder="Descreva seus sintomas ou motivo da consulta..."
            style="resize: vertical;"
          ></textarea>
        </div>

        <!-- Botões -->
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button type="submit" class="btn btn-primario" :disabled="carregando" style="flex: 1; justify-content: center;">
            {{ carregando ? 'Agendando...' : '✅ Confirmar Agendamento' }}
          </button>
          <RouterLink to="/dashboard" class="btn btn-outline">
            Cancelar
          </RouterLink>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const erro = ref('')
const sucesso = ref('')
const avisoClima = ref('')
const carregando = ref(false)
const verificandoClima = ref(false)

const form = ref({
  medico: '',
  especialidade: '',
  dataHora: '',
  observacoes: ''
})

// Data mínima = agora (não pode agendar no passado)
// toISOString() retorna "2024-12-25T14:30:00.000Z"
// slice(0, 16) pega só "2024-12-25T14:30" (formato do input)
const dataMinima = computed(() => {
  const agora = new Date()
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset())
  return agora.toISOString().slice(0, 16)
})

// Verifica previsão do clima quando o usuário escolhe uma data
async function verificarClima() {
  if (!form.value.dataHora) return

  avisoClima.value = ''
  verificandoClima.value = true

  try {
    const data = form.value.dataHora.split('T')[0] // Só a data "2024-12-25"
    const res = await api.get(`/clima/verificar?data=${data}`)

    if (res.data.vai_chover === true) {
      avisoClima.value = '🌧️ ' + res.data.mensagem
    }
  } catch (e) {
    // Silencioso — o clima não é obrigatório
  } finally {
    verificandoClima.value = false
  }
}

async function agendar() {
  erro.value = ''
  sucesso.value = ''
  carregando.value = true

  try {
    const res = await api.post('/agendamentos', {
      medico: form.value.medico,
      especialidade: form.value.especialidade,
      dataHora: new Date(form.value.dataHora).toISOString(),
      observacoes: form.value.observacoes
    })

    sucesso.value = '✅ Consulta agendada com sucesso!'

    // Se o servidor retornou aviso de chuva, mostra
    if (res.data.aviso) {
      avisoClima.value = res.data.aviso
    }

    // Aguarda 2 segundos e redireciona
    setTimeout(() => router.push('/meus-agendamentos'), 2000)

  } catch (e) {
    erro.value = e.response?.data?.erro || 'Erro ao agendar. Tente novamente.'
  } finally {
    carregando.value = false
  }
}
</script>
