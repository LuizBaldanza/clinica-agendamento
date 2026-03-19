// ============================================================
// controllers/agendamentoController.js — Lógica de agendamentos
// ============================================================

const Agendamento = require('../models/Agendamento');
const axios = require('axios'); // Para fazer chamadas a APIs externas

// ============================================================
// CRIAR AGENDAMENTO
// ============================================================
const criar = async (req, res) => {
  try {
    const { medico, especialidade, dataHora, observacoes } = req.body;

    if (!medico || !especialidade || !dataHora) {
      return res.status(400).json({
        erro: 'Médico, especialidade e data/hora são obrigatórios.'
      });
    }

    const dataConsulta = new Date(dataHora);

    // Verifica se a data não é no passado
    if (dataConsulta < new Date()) {
      return res.status(400).json({ erro: 'Não é possível agendar para uma data passada.' });
    }

    // --------------------------------------------------------
    // VERIFICAÇÃO DE HORÁRIO DISPONÍVEL
    // Verifica se já existe uma consulta para o mesmo médico
    // no mesmo horário (janela de 30 minutos)
    // --------------------------------------------------------
    const inicioJanela = new Date(dataConsulta.getTime() - 30 * 60 * 1000); // 30 min antes
    const fimJanela = new Date(dataConsulta.getTime() + 30 * 60 * 1000);   // 30 min depois

    const conflito = await Agendamento.findOne({
      medico,
      dataHora: { $gte: inicioJanela, $lte: fimJanela },
      status: { $ne: 'cancelado' } // Ignora os cancelados
    });

    if (conflito) {
      return res.status(409).json({
        erro: 'Este médico já tem uma consulta neste horário. Escolha outro horário.'
      });
    }

    // --------------------------------------------------------
    // VERIFICA PREVISÃO DE CHUVA
    // Chama nossa própria rota de clima para verificar
    // --------------------------------------------------------
    let previsaoChuva = null;
    try {
      const climaRes = await axios.get(
        `http://localhost:${process.env.PORT || 3001}/api/clima/verificar`,
        {
          params: {
            data: dataConsulta.toISOString().split('T')[0] // Só a data: "2024-12-25"
          }
        }
      );
      previsaoChuva = climaRes.data.vai_chover;
    } catch (e) {
      // Se a API de clima falhar, continua sem essa informação
      console.log('Aviso: não foi possível verificar clima:', e.message);
    }

    // Cria o agendamento
    const agendamento = new Agendamento({
      paciente: req.usuario._id,
      medico,
      especialidade,
      dataHora: dataConsulta,
      observacoes,
      previsaoChuva
    });

    await agendamento.save();

    // Busca o agendamento com os dados do paciente preenchidos
    const agendamentoPopulado = await Agendamento.findById(agendamento._id)
      .populate('paciente', 'nome email telefone');

    res.status(201).json({
      mensagem: 'Consulta agendada com sucesso!',
      agendamento: agendamentoPopulado,
      aviso: previsaoChuva
        ? '⚠️ Atenção: há previsão de chuva no dia da sua consulta!'
        : null
    });

  } catch (erro) {
    console.error('Erro ao criar agendamento:', erro);
    res.status(500).json({ erro: 'Erro ao criar agendamento.' });
  }
};

// ============================================================
// LISTAR AGENDAMENTOS
// ============================================================
const listar = async (req, res) => {
  try {
    let filtro = {};

    // Se é paciente, só vê os próprios agendamentos
    // Se é secretário, vê todos
    if (req.usuario.perfil === 'paciente') {
      filtro.paciente = req.usuario._id;
    }

    // Filtros opcionais por query string (?status=agendado&medico=Dr.Silva)
    if (req.query.status) filtro.status = req.query.status;
    if (req.query.medico) filtro.medico = new RegExp(req.query.medico, 'i');

    const agendamentos = await Agendamento.find(filtro)
      .populate('paciente', 'nome email telefone')
      .sort({ dataHora: 1 }); // Ordena por data crescente

    res.json({ agendamentos });

  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar agendamentos.' });
  }
};

// ============================================================
// BUSCAR UM AGENDAMENTO POR ID
// ============================================================
const buscarPorId = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id)
      .populate('paciente', 'nome email telefone');

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    // Paciente só pode ver o próprio agendamento
    if (
      req.usuario.perfil === 'paciente' &&
      agendamento.paciente._id.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }

    res.json({ agendamento });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar agendamento.' });
  }
};

// ============================================================
// ATUALIZAR STATUS (só secretário)
// ============================================================
const atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const statusValidos = ['agendado', 'confirmado', 'cancelado', 'realizado'];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido.' });
    }

    const agendamento = await Agendamento.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('paciente', 'nome email');

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    res.json({ mensagem: 'Status atualizado!', agendamento });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar status.' });
  }
};

// ============================================================
// CANCELAR (paciente pode cancelar o próprio)
// ============================================================
const cancelar = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }

    if (agendamento.paciente.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ erro: 'Você só pode cancelar suas próprias consultas.' });
    }

    agendamento.status = 'cancelado';
    await agendamento.save();

    res.json({ mensagem: 'Consulta cancelada com sucesso.' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cancelar.' });
  }
};

module.exports = { criar, listar, buscarPorId, atualizarStatus, cancelar };
