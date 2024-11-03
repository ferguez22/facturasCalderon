// URL BASE: /api
const express = require('express');
const router = express.Router();

router.use('/facturas', require('./api/facturas.routes'));
router.use('/clientes', require('./api/clientes.routes'));
router.use('/configuracion', require('./api/config.routes'));

module.exports = router;