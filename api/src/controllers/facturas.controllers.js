const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

const { selectInvoices, selectInvoiceById, insertInvoice, deleteInvoice, selectInvoicesByClient, selectInvoiceStats } = require('../models/facturas.models');


// Get all invoices
const getInvoices = async (req, res, next) => {
    try {
        const facturas = await selectInvoices();
        res.json({
            message: 'Facturas recuperadas con éxito',
            facturas
        });
    } catch (error) {
        next(error);
    }
}

// Get an invoice by id
const getInvoiceById = async (req, res, next) => {
    try {
        const factura = await selectInvoiceById(req.params.id);
        if (!factura) {
            return res.status(404).json({
                message: 'Factura no encontrada'
            });
        }
        res.json({
            message: 'Factura recuperada con éxito',
            factura
        });
    } catch (error) {
        next(error);
    }
}

// Get invoices by client
const getInvoicesByClient = async (req, res, next) => {
    try {
        const facturas = await selectInvoicesByClient(req.params.clienteId);
        res.json({ facturas });
    } catch (error) {
        next(error);
    }
}

// Get invoice stats
const getInvoiceStats = async (req, res, next) => {
    try {
        const stats = await selectInvoiceStats();
        res.json({ stats });
        console.log(stats);

    } catch (error) {
        next(error);
    }
}

// Create a new invoice
const createInvoice = async (req, res, next) => {
    try {
        const { cliente_id, numero_factura, descripcion, items } = req.body;

        // Validaciones
        if (!cliente_id || !numero_factura || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Datos incompletos',
                required: ['cliente_id', 'numero_factura', 'items (array)']
            });
        }

        // Validar items
        for (const item of items) {
            if (!item.descripcion || !item.largo_mm || !item.ancho_mm || !item.unidades) {
                return res.status(400).json({
                    message: 'Datos incompletos en items',
                    required: ['descripcion', 'largo_mm', 'ancho_mm', 'unidades']
                });
            }

            if (item.largo_mm <= 0 || item.ancho_mm <= 0 || item.unidades <= 0) {
                return res.status(400).json({
                    message: 'Los valores numéricos deben ser mayores a 0'
                });
            }
        }

        const facturaId = await insertInvoice(req.body);
        const nuevaFactura = await selectInvoiceById(facturaId);

        res.status(201).json({
            message: 'Factura creada con éxito',
            factura: nuevaFactura
        });
    } catch (error) {
        next(error);
    }
}

// Delete an invoice
const deleteInvoiceById = async (req, res, next) => {
    try {
        const deleted = await deleteInvoice(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                message: 'Factura no encontrada'
            });
        }
        res.json({
            message: 'Factura eliminada con éxito'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    deleteInvoiceById,
    getInvoicesByClient,
    getInvoiceStats,
};