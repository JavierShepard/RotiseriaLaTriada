// controllers/productoController.js
const Producto = require('../models/Producto');

// Obtener todos los productos
exports.getAllProductos = (req, res) => {
  Producto.getAll((err, productos) => {
    if (err) return res.status(500).send(err);
    res.json(productos);
  });
};

// Obtener un producto por ID
exports.getProductoById = (req, res) => {
  const { id } = req.params;
  Producto.getById(id, (err, producto) => {
    if (err) return res.status(500).send(err);
    if (!producto.length) return res.status(404).send('Producto no encontrado');
    res.json(producto[0]);
  });
};

// Crear un nuevo producto
exports.createProducto = (req, res) => {
  const nuevoProducto = {
    nombre: req.body.nombre,
    stock: req.body.stock,
    precio: req.body.precio
  };

  Producto.create(nuevoProducto, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('Producto creado exitosamente');
  });
};


// Actualizar un producto por ID
exports.updateProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, stock, precio } = req.body;

  Producto.updateById(id, { nombre, stock, precio }, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send('Producto no encontrado');
    res.status(200).send('Producto actualizado exitosamente');
  });
};


// Eliminar un producto por ID
exports.deleteProducto = (req, res) => {
  const { id } = req.params;

  Producto.deleteById(id, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send('Producto no encontrado');
    res.status(200).send('Producto eliminado');
  });
};
// Obtener un producto por ID
exports.getProductoById = (req, res) => {
  const { id } = req.params;
  Producto.getById(id, (err, producto) => {
    if (err) return res.status(500).send(err);
    if (!producto) return res.status(404).send('Producto no encontrado');
    res.json(producto);
  });
};
