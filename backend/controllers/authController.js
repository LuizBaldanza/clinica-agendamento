// ============================================================
// controllers/authController.js — Lógica de login e cadastro
// ============================================================
// Controllers são as funções que realmente processam os pedidos.
// A rota diz "quando chegar um POST /login, chame essa função".
// O controller faz o trabalho e envia a resposta.

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ============================================================
// CADASTRO — Cria um novo usuário
// ============================================================
const cadastrar = async (req, res) => {
  try {
    // Pega os dados enviados no corpo da requisição (formulário)
    const { nome, email, senha, perfil, telefone } = req.body;

    // Validação básica
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    // Verifica se já existe um usuário com esse email
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Este email já está cadastrado.' });
    }

    // Cria o novo usuário (a senha será embaralhada automaticamente pelo model)
    const novoUsuario = new Usuario({
      nome,
      email,
      senha,
      perfil: perfil || 'paciente',
      telefone
    });

    // Salva no banco de dados
    await novoUsuario.save();

    // Cria o token JWT para o usuário já ficar logado após o cadastro
    const token = jwt.sign(
      { id: novoUsuario._id, perfil: novoUsuario.perfil }, // Dados dentro do token
      process.env.JWT_SECRET,                               // Chave secreta
      { expiresIn: '7d' }                                   // Expira em 7 dias
    );

    // Responde com sucesso (status 201 = criado com sucesso)
    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      token,
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil
      }
    });

  } catch (erro) {
    console.error('Erro no cadastro:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// ============================================================
// LOGIN — Autentica um usuário existente
// ============================================================
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    // Busca o usuário pelo email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      // Mensagem genérica por segurança (não revela se email existe)
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    // Compara a senha digitada com a senha embaralhada no banco
    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    // Cria o token JWT
    const token = jwt.sign(
      { id: usuario._id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Responde com o token e dados do usuário
    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    });

  } catch (erro) {
    console.error('Erro no login:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// ============================================================
// PERFIL — Retorna dados do usuário logado
// ============================================================
const perfil = async (req, res) => {
  // req.usuario foi adicionado pelo middleware de autenticação
  res.json({ usuario: req.usuario });
};

// ============================================================
// ATUALIZAR ENDEREÇO — Salva o endereço do paciente
// ============================================================
const atualizarEndereco = async (req, res) => {
  try {
    const { cep, logradouro, bairro, cidade, estado, numero, complemento } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      { endereco: { cep, logradouro, bairro, cidade, estado, numero, complemento } },
      { new: true } // Retorna o documento atualizado
    ).select('-senha');

    res.json({ mensagem: 'Endereço atualizado!', usuario });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar endereço.' });
  }
};

module.exports = { cadastrar, login, perfil, atualizarEndereco };
