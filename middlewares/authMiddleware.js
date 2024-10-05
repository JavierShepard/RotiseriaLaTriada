// middlewares/authMiddleware.js
const axios = require('axios');
const cache = new Map(); // Simple cache en memoria

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización faltante.' });
  }

  // Comprobar si el token ya ha sido validado y está en cache
  if (cache.has(token)) {
    req.usuario = cache.get(token);
    return next();
  }

  try {
    const response = await axios.get('https://taller6-alejo.onrender.com/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000, // Timeout de 5 segundos
    });

    if (response.status === 200) {
      req.usuario = response.data;
      cache.set(token, response.data); // Almacenar en caché
      return next();
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'No autorizado. Token inválido.' });
    } else {
      return res.status(500).json({ error: 'Error al validar el token.' });
    }
  }
};

module.exports = authMiddleware;
