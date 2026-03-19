<template>
  <div class="container" style="padding-bottom: 40px;">
    <h1 class="titulo-pagina">🛠️ Painel Administrativo</h1>
    <p class="subtitulo-pagina">Gerencie todos os atendimentos da clínica</p>

    <!-- Estatísticas rápidas -->
    <div class="grid-stats">
      <div class="card stat-card">
        <span class="stat-numero">{{ stats.total }}</span>
        <span class="stat-label">Total de consultas</span>
      </div>
      <div class="card stat-card">
        <span class="stat-numero" style="color: var(--cor-primaria);">{{ stats.agendados }}</span>
        <span class="stat-label">Agendados</span>
      </div>
      <div class="card stat-card">
        <span class="stat-numero" style="color: var(--cor-sucesso);">{{ stats.confirmados }}</span>
        <span class="stat-label">Confirmados</span>
      </div>
      <div class="card stat-card">
        <span class="stat-numero" style="color: var(--cor-perigo);">{{ stats.cancelados }}</span>
        <span class="stat-label">Cancelados</span>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card" style="margin-bottom: 20px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end;">
        <div class="form-grupo" style="margin: 0; flex: 1; min-width: 140px;">
          <label>Status</label>
          <select v-model="filtroStatus" @change="buscar">
            <option value="">Todos</option>
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div class="form-grupo" style="margin: 0; flex: 2; min-width: 200px;">
          <label>Buscar por médico</label>
          <input v-model="filtroMedico" type="text" placeholder="Nome do médico..." @input="buscar" />
        </div>
      </div>
    </div>

    <!-- Tabela de agendamentos -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div v-if="carregando" style="padding: 40px; text-align: center; color: var(--cor-texto-suave);">
        Carregando...
      </div>

      <div v-else-if="agendamentos.length === 0" style="padding: 40px; text-align: center; color: var(--cor-texto-suave);">
        Nenhum agendamento encontrado.
      </div>

      <table v-else class="tabela">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Médico / Especialidade</th>
            <th>Data e Hora</th>
            <th>Status</th>
            <th>Clima</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ag in agendamentos" :key="ag._id">
            <td>
              <strong>{{ ag.paciente?.nome }}</strong>
              <br>
              <span style="font-size: 12px; color: var(--cor-texto-suave);">{{ ag.paciente?.email }}</span>
            </td>
            <td>
              Dr(a). {{ ag.medico }}
              <br>
              <span style="font-size: 12px; color: var(--cor-texto-suave);">{{ ag.especialidade }}</span>
            </td>
            <td style="font-size: 13px;">{{ formatarData(ag.dataHora) }}</td>
            <td><span :class="'badge badge-' + ag.status">{{ ag.status }}</span></td>
            <td style="text-align: center;">
              <span v-if="ag.previsaoChuva === true" title="Previsão de chuva">🌧️</span>
              <span v-else-if="ag.previsaoChuva === false" title="Sem chuva">☀️</span>
              <span v-else title="Não verificado">—</span>
            </td>
            <td>
              <select
                class="select-status"
                :value="ag.status"
                @change="(e) => atualizarStatus(ag._id, e.target.value)"
                :disabled="ag.status === 'cancelado'"
              >
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const agendamentos = ref([])
const carregando = ref(true)
const filtroStatus = ref('')
const filtroMedico = ref('')

const stats = computed(() => ({
  total: agendamentos.value.length,
  agendados: agendamentos.value.filter(a => a.status === 'agendado').length,
  confirmados: agendamentos.value.filter(a => a.status === 'confirmado').length,
  cancelados: agendamentos.value.filter(a => a.status === 'cancelado').length
}))

function formatarData(dataStr) {
  return new Date(dataStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function buscar() {
  carregando.value = true
  try {
    let params = []
    if (filtroStatus.value) params.push(`status=${filtroStatus.value}`)
    if (filtroMedico.value) params.push(`medico=${filtroMedico.value}`)
    const query = params.length ? '?' + params.join('&') : ''
    const res = await api.get(`/agendamentos${query}`)
    agendamentos.value = res.data.agendamentos
  } catch (e) {
    console.error(e)
  } finally {
    carregando.value = false
  }
}

async function atualizarStatus(id, novoStatus) {
  try {
    await api.patch(`/agendamentos/${id}/status`, { status: novoStatus })
    await buscar()
  } catch (e) {
    alert(e.response?.data?.erro || 'Erro ao atualizar.')
  }
}

onMounted(buscar)
</script>

<style scoped>
.grid-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card { text-align: center; }
.stat-numero { display: block; font-size: 32px; font-weight: 700; }
.stat-label { font-size: 13px; color: var(--cor-texto-suave); }

.tabela {
  width: 100%;
  border-collapse: collapse;
}
.tabela th {
  background: var(--cor-fundo);
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--cor-texto-suave);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--cor-borda);
}
.tabela td {
  padding: 12px 16px;
  font-size: 13px;
  border-bottom: 1px solid var(--cor-borda);
  vertical-align: middle;
}
.tabela tr:last-child td { border-bottom: none; }
.tabela tr:hover td { background: #f8fafc; }

.select-status {
  padding: 4px 8px;
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio);
  font-size: 12px;
  cursor: pointer;
}
</style>
