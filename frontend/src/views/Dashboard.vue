<template>
  <div class="container" style="padding-bottom: 40px;">
    <!-- Boas-vindas -->
    <div class="boas-vindas card" style="margin-bottom: 24px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; border: none;">
      <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 4px;">
        Olá, {{ auth.usuario?.nome?.split(' ')[0] }}! 👋
      </h1>
      <p style="opacity: 0.85; font-size: 14px;">
        {{ auth.eSecretario ? 'Painel de Secretário — gerencie todos os atendimentos' : 'Bem-vindo ao seu painel de saúde' }}
      </p>
    </div>

    <!-- Cards de ação rápida -->
    <div class="grid-acoes">
      <RouterLink to="/agendamento/novo" class="card card-acao">
        <span class="acao-icone">📅</span>
        <strong>Agendar Consulta</strong>
        <p>Marque uma nova consulta médica</p>
      </RouterLink>

      <RouterLink to="/meus-agendamentos" class="card card-acao">
        <span class="acao-icone">📋</span>
        <strong>Minhas Consultas</strong>
        <p>Veja e gerencie seus agendamentos</p>
      </RouterLink>

      <RouterLink to="/perfil" class="card card-acao">
        <span class="acao-icone">👤</span>
        <strong>Meu Perfil</strong>
        <p>Atualize seus dados e endereço</p>
      </RouterLink>

      <RouterLink v-if="auth.eSecretario" to="/painel" class="card card-acao card-acao-destaque">
        <span class="acao-icone">🛠️</span>
        <strong>Painel Administrativo</strong>
        <p>Gerencie todos os atendimentos</p>
      </RouterLink>
    </div>

    <!-- Próximas consultas -->
    <div class="card" style="margin-top: 28px;">
      <h2 style="font-size: 17px; font-weight: 600; margin-bottom: 16px;">
        📅 Próximas Consultas
      </h2>

      <div v-if="carregando" style="text-align: center; padding: 20px; color: var(--cor-texto-suave);">
        Carregando...
      </div>

      <div v-else-if="proximasConsultas.length === 0" style="text-align: center; padding: 24px; color: var(--cor-texto-suave);">
        <p style="font-size: 32px; margin-bottom: 8px;">📭</p>
        <p>Nenhuma consulta agendada.</p>
        <RouterLink to="/agendamento/novo" class="btn btn-primario" style="margin-top: 12px; display: inline-flex;">
          Agendar agora
        </RouterLink>
      </div>

      <div v-else>
        <div v-for="ag in proximasConsultas" :key="ag._id" class="item-consulta">
          <div class="consulta-info">
            <strong>{{ ag.especialidade }} — Dr(a). {{ ag.medico }}</strong>
            <span>{{ formatarData(ag.dataHora) }}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span v-if="ag.previsaoChuva" title="Há previsão de chuva!" style="font-size: 18px;">🌧️</span>
            <span :class="'badge badge-' + ag.status">{{ ag.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const auth = useAuthStore()
const proximasConsultas = ref([])
const carregando = ref(true)

// Formata data de forma amigável: "25 de Dezembro de 2024, 14:30"
function formatarData(dataStr) {
  const data = new Date(dataStr)
  return data.toLocaleString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// onMounted = executa quando a tela é carregada
onMounted(async () => {
  try {
    const res = await api.get('/agendamentos?status=agendado')
    // Pega só as 3 próximas consultas
    proximasConsultas.value = res.data.agendamentos.slice(0, 3)
  } catch (e) {
    console.error(e)
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.grid-acoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.card-acao {
  text-decoration: none;
  color: var(--cor-texto);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: block;
}
.card-acao:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.card-acao-destaque {
  border-color: var(--cor-primaria);
  background: #eff6ff;
}

.acao-icone {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.card-acao strong {
  display: block;
  font-size: 15px;
  margin-bottom: 4px;
  color: var(--cor-texto);
}

.card-acao p {
  font-size: 13px;
  color: var(--cor-texto-suave);
}

.item-consulta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--cor-borda);
}
.item-consulta:last-child { border-bottom: none; }

.consulta-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.consulta-info strong { font-size: 14px; }
.consulta-info span { font-size: 13px; color: var(--cor-texto-suave); }
</style>
