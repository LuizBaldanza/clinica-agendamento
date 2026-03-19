# 🏥 Sistema de Agendamento de Consultas — Clínica Médica

Sistema web completo para gerenciamento de consultas médicas,
desenvolvido com Vue.js (frontend) e Node.js + Express (backend).

---

## 📋 Funcionalidades

- ✅ Cadastro e login seguro com JWT
- ✅ Agendamento de consultas com verificação de horário disponível
- ✅ Preenchimento automático de endereço pelo CEP (ViaCEP)
- ✅ Alerta de previsão de chuva no dia da consulta (OpenWeatherMap)
- ✅ Painel administrativo para secretários
- ✅ Diferenciação de perfis: paciente e secretário

---

## 🛠️ Tecnologias Utilizadas

| Camada    | Tecnologia               | Para que serve                        |
|-----------|--------------------------|---------------------------------------|
| Frontend  | Vue.js 3 + Vite          | Telas e interface do usuário          |
| Frontend  | Vue Router 4             | Navegação entre páginas               |
| Frontend  | Pinia                    | Gerenciamento de estado global        |
| Frontend  | Axios                    | Chamadas HTTP para o backend          |
| Backend   | Node.js + Express        | Servidor e rotas da API               |
| Backend   | MongoDB + Mongoose       | Banco de dados                        |
| Backend   | JWT (jsonwebtoken)       | Autenticação segura                   |
| Backend   | bcryptjs                 | Criptografia de senhas                |
| API       | ViaCEP                   | Busca de endereço por CEP (grátis)    |
| API       | OpenWeatherMap           | Previsão do tempo                     |

---

## ⚙️ Pré-requisitos

Antes de tudo, instale:

1. **Node.js** (v18 ou superior): https://nodejs.org
   - Após instalar, verifique: `node --version`

2. **Conta no MongoDB Atlas** (banco de dados gratuito na nuvem):
   - Acesse: https://www.mongodb.com/cloud/atlas
   - Crie uma conta gratuita
   - Crie um cluster (servidor) gratuito
   - Copie a "Connection String" (URI de conexão)

3. **Chave da API do clima** (gratuita):
   - Acesse: https://openweathermap.org/api
   - Crie uma conta gratuita
   - Vá em "API Keys" e copie sua chave

---

## 🚀 Como Executar o Projeto

### Passo 1 — Configurar o Backend

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências (bibliotecas)
npm install

# Copie o arquivo de configurações
# No Windows:
copy .env.example .env
# No Mac/Linux:
cp .env.example .env
```

Abra o arquivo `.env` e preencha:
```
MONGODB_URI=sua_string_do_mongodb_atlas_aqui
JWT_SECRET=qualquer_texto_longo_e_secreto_aqui
PORT=3001
OPENWEATHER_API_KEY=sua_chave_openweathermap_aqui
```

```bash
# Inicia o servidor backend
npm run dev
# Você deve ver: ✅ Conectado ao MongoDB e ✅ Servidor rodando em http://localhost:3001
```

### Passo 2 — Configurar o Frontend

**Abra um NOVO terminal** (sem fechar o anterior) e:

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicia o servidor de desenvolvimento
npm run dev
# Você deve ver: Local: http://localhost:5173
```

### Passo 3 — Acessar o Sistema

Abra o navegador e acesse: **http://localhost:5173**

---

## 👥 Como Criar um Usuário Secretário

1. Acesse http://localhost:5173/cadastro
2. Preencha os dados
3. No campo "Tipo de conta", selecione **Secretário(a)**
4. Clique em "Criar Conta"

O secretário terá acesso ao Painel Administrativo.

---

## 📁 Estrutura de Pastas

```
clinica/
├── backend/
│   ├── controllers/        # Lógica das funcionalidades
│   │   ├── authController.js
│   │   └── agendamentoController.js
│   ├── middleware/         # Funções intermediárias
│   │   └── auth.js         # Verificação de JWT
│   ├── models/             # Estrutura dos dados
│   │   ├── Usuario.js
│   │   └── Agendamento.js
│   ├── routes/             # Endereços da API
│   │   ├── auth.js
│   │   ├── agendamentos.js
│   │   ├── cep.js
│   │   └── clima.js
│   ├── server.js           # Ponto de entrada
│   ├── .env.example        # Modelo de configurações
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── assets/         # CSS global
    │   ├── views/          # Telas/páginas
    │   │   ├── Login.vue
    │   │   ├── Cadastro.vue
    │   │   ├── Dashboard.vue
    │   │   ├── NovoAgendamento.vue
    │   │   ├── MeusAgendamentos.vue
    │   │   ├── Painel.vue
    │   │   └── Perfil.vue
    │   ├── stores/         # Estado global (Pinia)
    │   │   └── auth.js
    │   ├── services/       # Configuração do Axios
    │   │   └── api.js
    │   ├── router/         # Navegação entre páginas
    │   │   └── index.js
    │   ├── App.vue         # Componente raiz
    │   └── main.js         # Ponto de entrada Vue
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🔌 Endpoints da API

### Autenticação
| Método | URL                  | Descrição              | Autenticação |
|--------|----------------------|------------------------|--------------|
| POST   | /api/auth/cadastro   | Criar nova conta       | Não          |
| POST   | /api/auth/login      | Fazer login            | Não          |
| GET    | /api/auth/perfil     | Ver dados do usuário   | JWT          |
| PUT    | /api/auth/endereco   | Atualizar endereço     | JWT          |

### Agendamentos
| Método | URL                           | Descrição                    | Perfil       |
|--------|-------------------------------|------------------------------|--------------|
| POST   | /api/agendamentos             | Criar agendamento            | Qualquer     |
| GET    | /api/agendamentos             | Listar agendamentos          | Qualquer     |
| GET    | /api/agendamentos/:id         | Ver um agendamento           | Qualquer     |
| PATCH  | /api/agendamentos/:id/status  | Mudar status                 | Secretário   |
| DELETE | /api/agendamentos/:id         | Cancelar agendamento         | Paciente     |

### Integrações
| Método | URL                        | Descrição                    |
|--------|----------------------------|------------------------------|
| GET    | /api/cep/:cep              | Buscar endereço pelo CEP     |
| GET    | /api/clima/verificar?data= | Verificar previsão de chuva  |

---

## 🌐 Deploy (Publicação Online)

### Backend — Render.com (gratuito)
1. Crie conta em https://render.com
2. New → Web Service → conecte seu repositório GitHub
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Adicione as variáveis de ambiente (MONGODB_URI, JWT_SECRET, etc.)

### Frontend — Vercel (gratuito)
1. Crie conta em https://vercel.com
2. Import Project → conecte seu repositório GitHub
3. Framework: Vite
4. Atualize a URL do backend no `vite.config.js`

---

## 👨‍💻 Desenvolvido para

Trabalho acadêmico — Sistema de Agendamento de Consultas Médicas
Tecnologias: Vue.js, Node.js, MongoDB, JWT, ViaCEP, OpenWeatherMap
