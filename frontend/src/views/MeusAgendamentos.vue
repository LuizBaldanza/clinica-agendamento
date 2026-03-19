<template>
  <div class="container" style="padding-bottom: 40px;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <h1 class="titulo-pagina" style="margin-bottom: 0;">📋 Minhas Consultas</h1>
      <RouterLink to="/agendamento/novo" class="btn btn-primario">+ Nova Consulta</RouterLink>
    </div>
    <p class="subtitulo-pagina">Gerencie seus agendamentos médicos</p>

    <!-- Filtros -->
    <div class="card" style="margin-bottom: 20px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end;">
        <div class="form-grupo" style="margin: 0; flex: 1; min-width: 140px;">
          <label>Filtrar por status</label>
          <select v-model="filtroStatus" @change="buscarAgendamentos">
            <option value="">Todos</option>
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <button @click="buscarAgendamentos" class="btn btn-outline" style="margin-bottom: 0;">
          🔄 Atualizar
        </button>
      </div>
    </div>

    <!-- Estado de carregamento -->
    <div v-if="carregando" style="text-align: center; padding: 40px; color: var(--cor-texto-suave);">
      Carregando consultas...
    </div>

    <!-- Sem resultados -->
    <div v-else-if="agendamentos.length === 0" class="card" style="text-align: center; padding: 40px;">
      <p style="font-size: 40px; margin-bottom: 12px;">📭</p>
      <p style="color: var(--cor-texto-suave); margin-bottom: 16px;">Nenhuma consulta encontrada.</p>
      <RouterLink to="/agendamento/novo" class="btn btn-primario" style="display: inline-flex;">
        Agendar primeira consulta
      </RouterLink>
    </div>

    <!-- Lista de agendamentos -->
    <div v-else class="lista-agendamentos">
      <div v-for="ag in agendamentos" :key="ag._id" class="card card-agendamento">
        <div class="agendamento-topo">
          <div>
            <h3>{{ ag.especialidade }}</h3>
            <p class="medico-nome">Dr(a). {{ ag.medico }}</p>
          </div>
          <span :class="'badge badge-' + ag.status">{{ ag.status }}</span>
        </div>

        <div class="agendamento-detalhes">
          <span>📅 {{ formatarData(ag.dataHora) }}</span>
          <span v-if="ag.previsaoChuva === true" class="aviso-chuva">🌧️ Previsão de chuva</span>
          <span v-if="ag.observacoes" style="color: var(--cor-texto-suave); font-size: 13px;">
            💬 {{ ag.observacoes }}
          </span>
        </div>

        <!-- Botão cancelar (só para agendamentos ativos) -->
        <div v-if="ag.status === 'agendado' || ag.status === 'confirmado'" style="margin-top: 12px;">
          <button
            @click="cancelarAgendamento(ag._id)"
            class="btn btn-perigo"
            style="font-size: 13px; padding: 6px 14px;"
            :disabled="cancelando === ag._id"
          >
            {{ cancelando === ag._id ? 'Cancelando...' : '❌ Cancelar consulta' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const agendamentos = ref([])
const carregando = ref(true)
const cancelando = ref(null)
const filtroStatus = ref('')

function formatarData(dataStr) {
  return new Date(dataStr).toLocaleString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function buscarAgendamentos() {
  carregando.value = true
  try {
    const params = filtroStatus.value ? `?status=${filtroStatus.value}` : ''
    const res = await api.get(`/agendamentos${params}`)
    agendamentos.value = res.data.agendamentos
  } catch (e) {
    console.error(e)
  } finally {
    carregando.value = false
  }
}

async function cancelarAgendamento(id) {
  if (!confirm('Tem certeza que deseja cancelar esta consulta?')) return
  cancelando.value = id
  try {
    await api.delete(`/agendamentos/${id}`)
    await buscarAgendamentos() // Recarrega a lista
  } catch (e) {
    alert(e.response?.data?.erro || 'Erro ao cancelar.')
  } finally {
    cancelando.value = null
  }
}

onMounted(buscarAgendamentos)
</script>

<style scoped>
.lista-agendamentos { display: flex; flex-direction: column; gap: 16px; }

.card-agendamento { transition: box-shadow 0.2s; }
.card-agendamento:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

.agendamento-topo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.agendamento-topo h3 { font-size: 16px; font-weight: 600; }
.medico-nome { font-size: 13px; color: var(--cor-texto-suave); margin-top: 2px; }

.agendamento-detalhes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: var(--cor-texto-suave);
}

.aviso-chuva { color: var(--cor-aviso); font-weight: 500; }
</style>
