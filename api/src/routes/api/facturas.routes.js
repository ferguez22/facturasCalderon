// URL BASE: /api/facturas
const express = require('express');
const router = express.Router();
const {
    getInvoices,
    getInvoiceById,
    createInvoice,
    deleteInvoiceById,
    getInvoicesByClient,
    getInvoiceStats,
} = require('../../controllers/facturas.controllers');

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.delete('/:id', deleteInvoiceById);
router.get('/cliente/:clienteId', getInvoicesByClient);
router.get('/stats', getInvoiceStats);


module.exports = router;