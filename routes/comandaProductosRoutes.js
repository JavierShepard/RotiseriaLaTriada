const express = require('express');
const router = express.Router();
const comandaProductosController = require('../controllers/comandaProductosController');
// Ruta para obtener todos los productos de una comanda específica por id_comanda
router.get('/:id_comanda', comandaProductosController.getProductosByComandaId);

router.get('/', comandaProductosController.getAllComandaProductos);
//router.get('/:id', comandaProductosController.getComandaProductoById);
router.post('/', comandaProductosController.createComandaProducto);
router.put('/:id', comandaProductosController.updateComandaProducto);
router.delete('/:id', comandaProductosController.deleteComandaProducto);



module.exports = router;
