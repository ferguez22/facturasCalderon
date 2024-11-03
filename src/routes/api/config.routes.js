const express = require('express');
const router = express.Router();
const { updatePrecioMetroCuadrado, getPrecioMetroCuadrado } = require('../../controllers/config.controllers');

router.get('/precio-metro-cuadrado', getPrecioMetroCuadrado);
router.put('/precio-metro-cuadrado', updatePrecioMetroCuadrado);

module.exports = router; 