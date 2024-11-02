const ComandaProducto = require('../models/ComandaProducto');
exports.getProductosByComandaId = (req, res) => {
  const { id_comanda } = req.params;

  ComandaProducto.getByComandaId(id_comanda, (err, productos) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!productos || productos.length === 0) return res.status(404).json({ error: 'No se encontraron productos para esta comanda' });
    
    res.json(productos);
  });
};

// Obtener todos los registros de comanda_productos
exports.getAllComandaProductos = (req, res) => {
  ComandaProducto.getAll((err, registros) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(registros);
  });
};

// Obtener un registro específico de comanda_productos
exports.getComandaProductoById = (req, res) => {
  const { id } = req.params;
  ComandaProducto.getById(id, (err, registro) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(registro);
  });
};

// Crear un nuevo registro en comanda_productos
exports.createComandaProducto = (req, res) => {
  const { id_comanda, id_producto, cantidad, subtotal } = req.body;

  ComandaProducto.create({ id_comanda, id_producto, cantidad, subtotal }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Producto agregado a la comanda exitosamente', result });
  });
};

// Actualizar un registro en comanda_productos
exports.updateComandaProducto = (req, res) => {
  const { id } = req.params;
  const { cantidad, subtotal } = req.body;

  ComandaProducto.updateById(id, { cantidad, subtotal }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.status(200).json({ message: 'Registro actualizado exitosamente' });
  });
};

// Eliminar un registro en comanda_productos
exports.deleteComandaProducto = (req, res) => {
  const { id } = req.params;

  ComandaProducto.deleteById(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.status(200).json({ message: 'Registro eliminado exitosamente' });
  });
};
// Obtener productos por id_comanda
exports.getProductosByComandaId = (req, res) => {
  const { id_comanda } = req.params;

  ComandaProducto.getByComandaId(id_comanda, (err, productos) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!productos || productos.length === 0) return res.status(404).json({ error: 'No se encontraron productos para esta comanda' });
    
    res.json(productos);
  });
};
