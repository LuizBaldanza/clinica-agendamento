// ============================================================
// models/Usuario.js — O "molde" de um usuário no banco de dados
// ============================================================
// Um Model define a estrutura dos dados que vamos salvar.
// Pense como uma ficha de cadastro: quais campos ela tem?

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Biblioteca para "embaralhar" senhas

// Schema = estrutura/molde do documento
const UsuarioSchema = new mongoose.Schema({
  
  nome: {
    type: String,       // Tipo texto
    required: true,     // Obrigatório
    trim: true          // Remove espaços do início e fim
  },

  email: {
    type: String,
    required: true,
    unique: true,       // Não pode ter dois usuários com mesmo email
    lowercase: true,    // Salva sempre em minúsculas
    trim: true
  },

  senha: {
    type: String,
    required: true,
    minlength: 6        // Mínimo 6 caracteres
  },

  perfil: {
    type: String,
    enum: ['paciente', 'secretario'], // Só aceita esses dois valores
    default: 'paciente'               // Se não informado, é paciente
  },

  // Endereço do paciente (preenchido com ViaCEP)
  endereco: {
    cep: String,
    logradouro: String,
    bairro: String,
    cidade: String,
    estado: String,
    numero: String,
    complemento: String
  },

  telefone: {
    type: String,
    trim: true
  },

  criadoEm: {
    type: Date,
    default: Date.now   // Data atual quando o usuário é criado
  }

});

// ============================================================
// HOOK — Roda automaticamente ANTES de salvar um usuário
// ============================================================
// Isso "embaralha" a senha antes de salvar no banco.
// Assim, mesmo que alguém acesse o banco, não vê a senha real.
UsuarioSchema.pre('save', async function(next) {
  // Se a senha não foi modificada, pula essa etapa
  if (!this.isModified('senha')) return next();
  
  // "salt" é um valor aleatório que deixa o embaralhamento único
  const salt = await bcrypt.genSalt(10);
  
  // Substitui a senha em texto pela senha embaralhada
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// ============================================================
// MÉTODO — Compara senha digitada com senha salva
// ============================================================
UsuarioSchema.methods.compararSenha = async function(senhaDigitada) {
  return await bcrypt.compare(senhaDigitada, this.senha);
};

// Exporta o model para ser usado em outros arquivos
module.exports = mongoose.model('Usuario', UsuarioSchema);
