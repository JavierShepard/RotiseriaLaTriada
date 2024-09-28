// routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas con autenticación
router.post('/productos', authMiddleware, productoController.createProducto);  // Crear un producto
router.put('/productos/:id', authMiddleware, productoController.updateProducto);  // Actualizar un producto por ID
router.delete('/productos/:id', authMiddleware, productoController.deleteProducto);  // Eliminar un producto por ID

// Rutas públicas
router.get('/productos', productoController.getAllProductos); // Obtener todos los productos
router.get('/productos/:id', productoController.getProductoById); // Obtener un producto por ID

module.exports = router;
