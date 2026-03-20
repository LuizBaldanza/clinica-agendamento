// ============================================================
// SERVER.JS — O ponto de entrada do nosso servidor
// ============================================================
// Este arquivo é o "coração" do backend. Ele inicia o servidor,
// conecta ao banco de dados e registra todas as rotas (endereços).

// "require" é como importar/trazer uma biblioteca para usar
const express = require('express');       // Framework para criar o servidor
const mongoose = require('mongoose');     // Biblioteca para conectar ao MongoDB
const cors = require('cors');             // Permite que o frontend acesse o backend
const dotenv = require('dotenv');         // Lê as variáveis do arquivo .env

// Carrega as configurações do arquivo .env
dotenv.config();

// Importa nossas rotas (cada arquivo cuida de um assunto)
const authRoutes = require('./routes/auth');
const agendamentoRoutes = require('./routes/agendamentos');
const cepRoutes = require('./routes/cep');
const climaRoutes = require('./routes/clima');

// Cria a aplicação Express
const app = express();

// ============================================================
// MIDDLEWARES — São funções que rodam antes de cada requisição
// ============================================================

// Permite receber dados em formato JSON (como um formulário digital)
app.use(express.json());

app.use(cors({
  origin: '*',
  credentials: false
}));
// ============================================================
// ROTAS — São os "endereços" da nossa API
// ============================================================
// Exemplo: POST /api/auth/login chama o controller de autenticação

app.use('/api/auth', authRoutes);               // Login e cadastro
app.use('/api/agendamentos', agendamentoRoutes); // Consultas/agendamentos
app.use('/api/cep', cepRoutes);                 // Busca de endereço por CEP
app.use('/api/clima', climaRoutes);             // Previsão do tempo

// Rota raiz — só para confirmar que o servidor está funcionando
app.get('/', (req, res) => {
  res.json({ mensagem: 'Servidor da Clínica funcionando! ✅' });
});

// ============================================================
// CONEXÃO COM O BANCO DE DADOS
// ============================================================
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    // Se conectou com sucesso, inicia o servidor
    console.log('✅ Conectado ao MongoDB com sucesso!');
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((erro) => {
    // Se deu erro, mostra a mensagem e para
    console.error('❌ Erro ao conectar ao MongoDB:', erro.message);
    process.exit(1);
  });
