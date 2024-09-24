// controllers/productoController.js
const Producto = require('../models/Producto');

exports.getAllProductos = (req, res) => {
  Producto.getAll((err, productos) => {
    if (err) return res.status(500).send(err);
    res.json(productos);
  });
};

exports.createProducto = (req, res) => {
  const nuevoProducto = {
    nombre: req.body.nombre,
    stock: req.body.stock,
    precio: req.body.precio
  };

  Producto.create(nuevoProducto, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('Producto creado');
  });
};
