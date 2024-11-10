const axios = require('axios');

let cotizacionDolarCache = null;
let lastCotizacionTimestamp = 0;

// Validar el token en múltiples endpoints
async function validarToken(token) {
  const endpoints = [
    'https://taller6-alejo.onrender.com/usuarios/1',
    'https://taller6-alejo.onrender.com/me',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      console.error(`Error validando token en ${endpoint}: ${error.message}`);
    }
  }

  return false;
}

// Obtener cotización del dólar
async function getCotizacionDolar() {
  const now = Date.now();
  if (cotizacionDolarCache && (now - lastCotizacionTimestamp) < 10 * 60 * 1000) {
    return cotizacionDolarCache;
  }

  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    cotizacionDolarCache = response.data.rates.ARS;
    lastCotizacionTimestamp = now;
    return cotizacionDolarCache;
  } catch (error) {
    console.error('Error al obtener la cotización del dólar:', error.message);
    throw new Error('No se pudo obtener la cotización del dólar');
  }
}

module.exports = { validarToken, getCotizacionDolar };
