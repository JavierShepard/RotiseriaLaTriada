const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const productoRoutes = require('./routes/productoRoutes');
const comandaRoutes = require('./routes/comandaRoutes');
const comandaProductosRoutes = require('./routes/comandaProductosRoutes');

require('dotenv').config();

// Lista de orígenes permitidos
const allowedOrigins = ['http://localhost:5174', 'http://localhost:5173', 'https://rotiserialatriada.onrender.com'];

// Configuración del middleware CORS dinámico
app.use(cors({
  origin: '*',  // Permitir todos los orígenes temporalmente
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
app.use('/api/comanda_productos', comandaProductosRoutes);

// Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
