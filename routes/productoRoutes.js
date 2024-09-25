// routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// Rutas para productos
router.get('/productos', productoController.getAllProductos);  // Obtener todos los productos
router.get('/productos/:id', productoController.getProductoById);  // Obtener un producto por ID
router.post('/productos', productoController.createProducto);  // Crear un nuevo producto
router.put('/productos/:id', productoController.updateProducto);  // Actualizar un producto por ID
router.delete('/productos/:id', productoController.deleteProducto);  // Eliminar un producto por ID

module.exports = router;
