const express = require('express');
const router = express.Router();
const comandaProductosController = require('../controllers/comandaProductosController');

router.get('/', comandaProductosController.getAllComandaProductos);
//router.get('/:id', comandaProductosController.getComandaProductoById);
router.post('/', comandaProductosController.createComandaProducto);
router.put('/:id', comandaProductosController.updateComandaProducto);
router.delete('/:id', comandaProductosController.deleteComandaProducto);
router.get('/comanda_productos/:id_comanda', comandaProductosController.getProductosByComandaId);


module.exports = router;
