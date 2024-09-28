// middlewares/authMiddleware.js
const axios = require('axios');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).send('Token de autorización faltante.');
  }

  try {
    // Llamada al endpoint /me para validar el token
    const response = await axios.get('https://app-98731bcf-e8fd-4bae-a6be-2b869e095968.cleverapps.io/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Verificamos si la respuesta es exitosa
    if (response.status === 200) {
      req.usuario = response.data; // Guardamos el usuario en req para usarlo más tarde
      return next();
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).send('No autorizado. Token inválido.');
    } else {
      return res.status(500).send('Error al validar el token.');
    }
  }
};

module.exports = authMiddleware;
