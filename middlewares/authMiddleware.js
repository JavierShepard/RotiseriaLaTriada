// middlewares/authMiddleware.js
const axios = require('axios');

// Middleware para validar el token llamando a /me
const authMiddleware = async (req, res, next) => {
  try {
    const response = await axios.get('https://example.com/me', {
      headers: {
        'Authorization': `Bearer ${req.headers.authorization}`  // Token desde el header
      }
    });

    if (response.status === 200) {
      req.usuario = response.data;  // Guardamos el usuario en el request para usar después
      return next();  // Pasamos al siguiente middleware o controlador
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).send('No autorizado.');
    } else {
      return res.status(500).send('Error al validar el token.');
    }
  }
};

module.exports = authMiddleware;
