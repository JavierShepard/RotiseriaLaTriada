// routes/comandaRoutes.js
const express = require('express');
const router = express.Router();
const comandaController = require('../controllers/comandaController');

// Rutas para comandas
router.get('/comandas', comandaController.getAllComandas);  // Obtener todas las comandas
router.get('/comandas/:id', comandaController.getComandaById);  // Obtener una comanda por ID
router.post('/comandas', comandaController.createComanda);  // Crear una nueva comanda
router.put('/comandas/:id', comandaController.updateComanda);  // Actualizar una comanda por ID
router.delete('/comandas/:id', comandaController.deleteComanda);  // Eliminar una comanda por ID

module.exports = router;
