const express = require('express');
const router = express.Router();
const comandaController = require('../controllers/comandaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas con autenticación
router.post('/', authMiddleware, comandaController.createComanda); // Crear una nueva comanda
router.put('/:id', authMiddleware, comandaController.updateComanda); // Actualizar una comanda existente
router.delete('/:id', authMiddleware, comandaController.deleteComanda); // Eliminar una comanda por ID

// Rutas públicas
router.get('/', comandaController.getAllComandas); // Obtener todas las comandas
router.get('/:id', comandaController.getComandaById); // Obtener una comanda por ID

module.exports = router;