// app.js
const express = require('express');
const helmet = require('helmet');
const app = express();
const cors = require('cors');

const productoRoutes = require('./routes/productoRoutes');
const comandaRoutes = require('./routes/comandaRoutes');
require('dotenv').config();
// Configuración del middleware CORS
app.use(cors({
  origin: 'http://localhost:5174',  // Permite solicitudes desde el frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Configurar Helmet con una política CSP personalizada
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "https://rotiserialatriada.onrender.com"], // Permitir fuentes desde tu dominio
      styleSrc: ["'self'", "'unsafe-inline'"], // Permitir estilos en línea si es necesario
    }
  }
}));

// Middleware
app.use(express.json());

// Rutas
app.use('/api', productoRoutes);
app.use('/api', comandaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
