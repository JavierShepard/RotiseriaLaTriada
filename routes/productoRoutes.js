// routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/productos', productoController.getAllProductos);
router.post('/productos', productoController.createProducto);

module.exports = router;
