// ============================================================
// routes/auth.js — Rotas de autenticação
// ============================================================
// Aqui definimos quais URLs existem e quais funções chamam.
// É como um catálogo de endereços do servidor.

const express = require('express');
const router = express.Router();
const { cadastrar, login, perfil, atualizarEndereco } = require('../controllers/authController');
const { autenticar } = require('../middleware/auth');

// POST /api/auth/cadastro — Cria novo usuário (não precisa de login)
router.post('/cadastro', cadastrar);

// POST /api/auth/login — Faz login (não precisa de login)
router.post('/login', login);

// GET /api/auth/perfil — Retorna dados do usuário logado (PRECISA de login)
router.get('/perfil', autenticar, perfil);

// PUT /api/auth/endereco — Atualiza endereço (PRECISA de login)
router.put('/endereco', autenticar, atualizarEndereco);

module.exports = router;
