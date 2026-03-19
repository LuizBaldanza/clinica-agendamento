// ============================================================
// routes/agendamentos.js — Rotas de agendamentos
// ============================================================

const express = require('express');
const router = express.Router();
const {
  criar,
  listar,
  buscarPorId,
  atualizarStatus,
  cancelar
} = require('../controllers/agendamentoController');
const { autenticar, apenasSecretario } = require('../middleware/auth');

// Todas as rotas aqui exigem que o usuário esteja logado (autenticar)

// POST /api/agendamentos — Cria um novo agendamento
router.post('/', autenticar, criar);

// GET /api/agendamentos — Lista agendamentos
// Paciente vê os seus, secretário vê todos
router.get('/', autenticar, listar);

// GET /api/agendamentos/:id — Busca um agendamento específico
router.get('/:id', autenticar, buscarPorId);

// PATCH /api/agendamentos/:id/status — Atualiza status (só secretário)
router.patch('/:id/status', autenticar, apenasSecretario, atualizarStatus);

// DELETE /api/agendamentos/:id — Cancela um agendamento
router.delete('/:id', autenticar, cancelar);

module.exports = router;
