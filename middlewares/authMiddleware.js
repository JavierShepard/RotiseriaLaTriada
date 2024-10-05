const axios = require('axios');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Extraer el token del encabezado

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización faltante.' });
  }

  try {
    const response = await axios.get('https://app-98731bcf-e8fd-4bae-a6be-2b869e095968.cleverapps.io/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      req.usuario = response.data;  // Guardar el usuario autenticado
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
