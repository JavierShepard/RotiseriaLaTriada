// controllers/pedidoController.js
const Pedido = require('../models/pedido');

const crearPedido = (req, res) => {
  const { precioTotal, cotizacionDolar, estado, productos } = req.body;

  if (!precioTotal || !cotizacionDolar || !estado || !productos) {
    return res.status(400).send('Datos incompletos.');
  }

  Pedido.crear(precioTotal, cotizacionDolar, estado, productos, (err, nuevoPedido) => {
    if (err) return res.status(500).send('Error al crear el pedido');
    res.status(201).json(nuevoPedido);
  });
};

const actualizarPedido = (req, res) => {
  const { id } = req.params;
  const { precioTotal, cotizacionDolar, estado } = req.body;

  if (!precioTotal || !cotizacionDolar || !estado) {
    return res.status(400).send('Datos incompletos.');
  }

  Pedido.actualizar(id, precioTotal, cotizacionDolar, estado, (err, pedidoActualizado) => {
    if (err) return res.status(500).send('Error al actualizar el pedido');
    res.json(pedidoActualizado);
  });
};

const eliminarPedido = (req, res) => {
  const { id } = req.params;

  Pedido.eliminar(id, (err, result) => {
    if (err) return res.status(500).send('Error al eliminar el pedido');
    res.status(204).send();
  });
};

const obtenerPedidos = (req, res) => {
  Pedido.obtenerTodos((err, pedidos) => {
    if (err) return res.status(500).send('Error al obtener los pedidos');
    res.json(pedidos);
  });
};

const obtenerPedidoPorId = (req, res) => {
  const { id } = req.params;

  Pedido.obtenerPorId(id, (err, pedido) => {
    if (err) return res.status(500).send('Error al obtener el pedido');
    res.json(pedido);
  });
};

module.exports = {
  crearPedido,
  actualizarPedido,
  eliminarPedido,
  obtenerPedidos,
  obtenerPedidoPorId
};
