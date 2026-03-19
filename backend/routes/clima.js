// ============================================================
// routes/clima.js — Rota para verificar previsão do tempo
// ============================================================
// Usamos a API OpenWeatherMap: https://openweathermap.org/
// Você precisa criar uma conta gratuita e pegar uma chave de API.
// Coloque a chave no arquivo .env como OPENWEATHER_API_KEY

const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/clima/verificar?data=2024-12-25
// Verifica se vai chover em São Paulo na data informada
router.get('/verificar', async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ erro: 'Informe a data no formato YYYY-MM-DD.' });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Cidade padrão: São Paulo (pode ser adaptado para pegar a cidade do usuário)
    const cidade = 'São Paulo,BR';

    // A API gratuita só prevê até 5 dias
    // Endpoint de previsão de 5 dias em intervalos de 3 horas
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&lang=pt_br&units=metric`;

    const resposta = await axios.get(url);

    // Filtra as previsões para o dia informado
    const previsoesNoDia = resposta.data.list.filter(item => {
      const dataItem = item.dt_txt.split(' ')[0]; // Pega só a data "2024-12-25"
      return dataItem === data;
    });

    // Verifica se alguma previsão do dia menciona chuva
    const vaiChover = previsoesNoDia.some(item => {
      const clima = item.weather[0].main.toLowerCase();
      return clima === 'rain' || clima === 'drizzle' || clima === 'thunderstorm';
    });

    // Monta descrição amigável
    const descricoes = previsoesNoDia.map(item => ({
      hora: item.dt_txt.split(' ')[1],
      descricao: item.weather[0].description,
      temperatura: Math.round(item.main.temp) + '°C'
    }));

    res.json({
      data,
      cidade,
      vai_chover: vaiChover,
      previsoes: descricoes,
      mensagem: vaiChover
        ? '⚠️ Há previsão de chuva. Lembre-se de trazer um guarda-chuva!'
        : '☀️ Sem previsão de chuva para este dia.'
    });

  } catch (erro) {
    console.error('Erro ao buscar clima:', erro.message);

    // Se a API de clima falhar, retorna null sem quebrar o sistema
    res.json({
      vai_chover: null,
      mensagem: 'Não foi possível verificar a previsão do tempo.'
    });
  }
});

module.exports = router;
