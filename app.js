const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const productoRoutes = require('./routes/productoRoutes');
const comandaRoutes = require('./routes/comandaRoutes');
require('dotenv').config();

// Lista de orígenes permitidos
const allowedOrigins = ['http://localhost:5174', 'http://localhost:5173', 'https://rotiserialatriada.onrender.com'];

// Configuración del middleware CORS dinámico
app.use(cors((req, callback) => {
  let corsOptions;
  let origin = req.header('Origin'); // Obtiene el origen de la solicitud

  // Verifica si el origen de la solicitud está en la lista de orígenes permitidos
  if (allowedOrigins.includes(origin)) {
    corsOptions = { origin: true }; // Permite este origen
  } else {
    corsOptions = { origin: false }; // Bloquea otros orígenes
  }
  callback(null, corsOptions); // Devuelve la configuración de CORS
}));

// Configurar Helmet con una política CSP personalizada
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "https://rotiserialatriada.onrender.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  }
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api', productoRoutes);
app.use('/api', comandaRoutes);

// Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
