// middlewares/authMiddleware.js
const axios = require('axios');

const authMiddleware = async (req, res, next) => {
  // Extraer el token del encabezado de autorización
  const token = req.headers.authorization?.split(' ')[1];  

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización faltante.' });
  }

  try {
    // Enviar el token para validarlo con la API de autenticación
    const response = await axios.get('https://app-98731bcf-e8fd-4bae-a6be-2b869e095968.cleverapps.io/me', {
      headers: {
        Authorization: `Bearer ${token}`,  // Incluir el token en el encabezado
      },
    });

    // Si la respuesta es 200, el token es válido
    if (response.status === 200) {
      req.usuario = response.data;  // Guardamos la información del usuario autenticado
      return next();
    }
  } catch (error) {
    // Manejar errores, por ejemplo, si el token no es válido
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'No autorizado. Token inválido.' });
    } else {
      return res.status(500).json({ error: 'Error al validar el token.' });
    }
  }
};

module.exports = authMiddleware;
