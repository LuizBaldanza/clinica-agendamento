// ============================================================
// middleware/auth.js — Proteção de rotas com JWT
// ============================================================
// Este middleware é como um "segurança" na porta.
// Antes de deixar entrar, ele verifica se o token é válido.
//
// COMO FUNCIONA:
// 1. Usuário faz login → servidor cria um token JWT
// 2. Frontend guarda esse token
// 3. Em toda requisição protegida, frontend envia o token
// 4. Este middleware verifica se o token é válido
// 5. Se válido: deixa passar. Se não: bloqueia com erro 401

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const autenticar = async (req, res, next) => {
  try {
    // Pega o token do cabeçalho da requisição
    // O frontend envia assim: "Authorization: Bearer eyJhbGci..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        erro: 'Acesso negado. Faça login para continuar.'
      });
    }

    // Separa o "Bearer " do token em si
    const token = authHeader.split(' ')[1];

    // Verifica e "decodifica" o token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário no banco usando o ID que estava no token
    const usuario = await Usuario.findById(decoded.id).select('-senha');
    // .select('-senha') = traz tudo EXCETO a senha

    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' });
    }

    // Coloca o usuário na requisição para usar nas próximas funções
    req.usuario = usuario;

    // Chama a próxima função (controller)
    next();

  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};

// Middleware extra: verifica se é secretário
const apenasSecretario = (req, res, next) => {
  if (req.usuario.perfil !== 'secretario') {
    return res.status(403).json({
      erro: 'Acesso restrito a secretários.'
    });
  }
  next();
};

module.exports = { autenticar, apenasSecretario };
