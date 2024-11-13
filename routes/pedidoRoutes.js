const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/pedidos', pedidoController.getAllPedidos);
router.get('/pedidos/:id', pedidoController.getPedidoById);
router.post('/pedidos', authMiddleware, pedidoController.createPedido);
router.patch('/pedidos/:id', authMiddleware, pedidoController.updatePedido);
router.delete('/pedidos/:id', authMiddleware, pedidoController.deletePedido);

module.exports = router;
