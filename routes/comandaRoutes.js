// routes/comandaRoutes.js
const express = require('express');
const router = express.Router();
const comandaController = require('../controllers/comandaController');

router.post('/comandas', comandaController.createComanda);

module.exports = router;
