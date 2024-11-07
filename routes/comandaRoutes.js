const express = require('express');
const router = express.Router();
const comandaController = require('../controllers/comandaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas con autenticación
router.post('/comandas', authMiddleware, comandaController.createComanda); // Crear una nueva comanda
router.put('/comandas/:id', authMiddleware, comandaController.updateComanda);
router.delete('/comandas/:id', authMiddleware, comandaController.deleteComanda); // Eliminar una comanda por ID

// Rutas públicas
router.get('/comandas', comandaController.getAllComandas); // Obtener todas las comandas
router.get('/comandas/:id', comandaController.getComandaById); // Obtener una comanda por ID

module.exports = router;
