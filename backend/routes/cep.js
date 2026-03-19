// ============================================================
// routes/cep.js — Rota para buscar endereço pelo CEP
// ============================================================
// Usamos a API pública ViaCEP: https://viacep.com.br/
// Não precisa de chave de API! É gratuita e sem limite.

const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/cep/:cep — Busca endereço pelo CEP
// Exemplo: GET /api/cep/01310100
router.get('/:cep', async (req, res) => {
  try {
    // Remove caracteres não numéricos do CEP (ex: "01310-100" → "01310100")
    const cep = req.params.cep.replace(/\D/g, '');

    // Valida se tem 8 dígitos
    if (cep.length !== 8) {
      return res.status(400).json({ erro: 'CEP deve ter 8 dígitos.' });
    }

    // Chama a API ViaCEP
    const resposta = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    // A ViaCEP retorna { erro: true } quando o CEP não existe
    if (resposta.data.erro) {
      return res.status(404).json({ erro: 'CEP não encontrado.' });
    }

    // Formata e retorna os dados do endereço
    res.json({
      cep: resposta.data.cep,
      logradouro: resposta.data.logradouro,
      bairro: resposta.data.bairro,
      cidade: resposta.data.localidade,
      estado: resposta.data.uf
    });

  } catch (erro) {
    console.error('Erro ao buscar CEP:', erro.message);
    res.status(500).json({ erro: 'Erro ao consultar o CEP. Tente novamente.' });
  }
});

module.exports = router;
