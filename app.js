// app.js
const express = require('express');
const app = express();
const productoRoutes = require('./routes/productoRoutes');
const comandaRoutes = require('./routes/comandaRoutes');
require('dotenv').config();

// Middleware
app.use(express.json());

// Rutas
app.use('/api', productoRoutes);
app.use('/api', comandaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
