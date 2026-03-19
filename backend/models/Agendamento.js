// ============================================================
// models/Agendamento.js — O "molde" de uma consulta agendada
// ============================================================

const mongoose = require('mongoose');

const AgendamentoSchema = new mongoose.Schema({

  // Referência ao usuário (paciente) — guarda o ID do paciente
  paciente: {
    type: mongoose.Schema.Types.ObjectId, // Tipo especial: ID do MongoDB
    ref: 'Usuario',                        // Aponta para o model Usuario
    required: true
  },

  // Referência ao secretário que criou (opcional)
  secretario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },

  // Nome do médico
  medico: {
    type: String,
    required: true,
    trim: true
  },

  // Especialidade médica
  especialidade: {
    type: String,
    required: true,
    trim: true
  },

  // Data e hora da consulta
  dataHora: {
    type: Date,
    required: true
  },

  // Status atual do agendamento
  status: {
    type: String,
    enum: ['agendado', 'confirmado', 'cancelado', 'realizado'],
    default: 'agendado'
  },

  // Observações adicionais
  observacoes: {
    type: String,
    trim: true
  },

  // Se vai chover no dia (preenchido pela API de clima)
  previsaoChuva: {
    type: Boolean,
    default: null // null = ainda não verificou
  },

  criadoEm: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Agendamento', AgendamentoSchema);
