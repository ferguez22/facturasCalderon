// URL BASE: /api/clientes
const express = require('express');
const router = express.Router();
const { getClientes, getClienteById, createCliente, updateClienteById, deleteClienteById } = require('../../controllers/clientes.controllers');

router.get('/', getClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateClienteById);
router.delete('/:id', deleteClienteById);


module.exports = router;