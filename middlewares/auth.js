// middlewares/auth.js
const jwt = require('jsonwebtoken');

const validarToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET || 'mi_secreto', (err, decoded) => {
      if (err) return reject(false);
      resolve(true);
    });
  });
};

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token de autorización faltante.');
  }

  try {
    const tokenValido = await validarToken(token);
    if (!tokenValido) {
      return res.status(401).send('No autorizado. Token inválido.');
    }
    next();
  } catch (error) {
    return res.status(500).send('Error en la validación del token');
  }
};

module.exports = authMiddleware;
