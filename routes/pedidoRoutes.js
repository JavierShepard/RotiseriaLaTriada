// routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const pedidoController = require('../controllers/pedidoController');

/* Rutas de pedidos protegidas por token
router.get('/', authMiddleware, pedidoController.obtenerPedidos);
router.get('/:id', authMiddleware, pedidoController.obtenerPedidoPorId);
router.post('/', authMiddleware, pedidoController.crearPedido);
router.put('/:id', authMiddleware, pedidoController.actualizarPedido);
router.delete('/:id', authMiddleware, pedidoController.eliminarPedido);*/

// Rutas de pedidos protegidas por token
router.get('/', pedidoController.obtenerPedidos);
router.get('/:id', pedidoController.obtenerPedidoPorId);
router.post('/', authMiddleware, pedidoController.crearPedido);
router.put('/:id', authMiddleware, pedidoController.actualizarPedido);
router.delete('/:id', authMiddleware, pedidoController.eliminarPedido);

module.exports = router;
