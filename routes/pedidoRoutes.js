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
router.get('/pedidos', pedidoController.obtenerPedidos);
router.get('/pedidos/:id', pedidoController.obtenerPedidoPorId);
router.post('/pedidos/', authMiddleware, pedidoController.crearPedido);
router.put('/pedidos/:id', authMiddleware, pedidoController.actualizarPedido);
router.delete('/pedidos/:id', authMiddleware, pedidoController.eliminarPedido);

module.exports = router;
