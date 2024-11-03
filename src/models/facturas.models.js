const pool = require('../config/db');
const PRECIO_METRO_CUADRADO = 116.11;

// Get all invoices
const selectInvoices = async () => {
    const [facturas] = await pool.query(`
        SELECT 
            f.*,
            c.nombre as cliente_nombre,
            (SELECT COUNT(*) FROM items_factura WHERE factura_id = f.id) as total_items,
            (SELECT SUM(total_metros_cuadrados) FROM items_factura WHERE factura_id = f.id) as total_metros_cuadrados,
            (SELECT SUM(total) FROM items_factura WHERE factura_id = f.id) as total
        FROM facturas f
        LEFT JOIN clientes c ON f.cliente_id = c.id
        ORDER BY f.fecha DESC
    `);

    return facturas;
};

// Get invoices by client
const selectInvoicesByClient = async (clienteId) => {
    const [rows] = await pool.query(`
        SELECT * FROM facturas WHERE cliente_id = ?
    `, [clienteId]);
    return rows;
}

// Get an invoice by id
const selectInvoiceById = async (id) => {
    // Obtener la factura con datos del cliente
    const [factura] = await pool.query(`
        SELECT f.*, c.nombre as cliente_nombre, c.NIF, c.direccion, c.ciudad, c.telefono, c.email
        FROM facturas f 
        LEFT JOIN clientes c ON f.cliente_id = c.id
        WHERE f.id = ?
    `, [id]);

    if (!factura[0]) return null;

    // Obtener los items de la factura
    const [items] = await pool.query('SELECT * FROM items_factura WHERE factura_id = ?', [id]);

    return {
        ...factura[0],
        items
    };
}

// Get invoice stats
const selectInvoiceStats = async () => {
    const [rows] = await pool.query(`
        SELECT * FROM facturas_estado
    `);
    return rows;
}

// Create a new invoice
const insertInvoice = async ({ cliente_id, numero_factura, descripcion, items }) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Insertar la factura principal
        const [facturaResult] = await connection.query(
            'INSERT INTO facturas (cliente_id, numero_factura, descripcion) VALUES (?, ?, ?)',
            [cliente_id, numero_factura, descripcion]
        );

        const facturaId = facturaResult.insertId;
        let subtotal = 0;

        // Insertar los items
        for (const item of items) {
            const metros_cuadrados = (item.largo_mm / 1000) * (item.ancho_mm / 1000);
            const precio_pieza = PRECIO_METRO_CUADRADO * metros_cuadrados;
            const total_metros_cuadrados = metros_cuadrados * item.unidades;
            const total = precio_pieza * item.unidades;

            await connection.query(
                `INSERT INTO items_factura (
                    factura_id, descripcion, largo_mm, ancho_mm, 
                    precio_metro_cuadrado, metros_cuadrados, precio_pieza, 
                    unidades, total_metros_cuadrados, total
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [facturaId, item.descripcion, item.largo_mm, item.ancho_mm,
                    PRECIO_METRO_CUADRADO, metros_cuadrados, precio_pieza,
                    item.unidades, total_metros_cuadrados, total]
            );

            subtotal += total;
        }

        // Calcular IVA y total
        const iva = subtotal * 0.21;
        const total = subtotal + iva;

        // Actualizar los totales de la factura
        await connection.query(
            'UPDATE facturas SET subtotal = ?, iva = ?, total = ? WHERE id = ?',
            [subtotal, iva, total, facturaId]
        );

        await connection.commit();
        return facturaId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Delete an invoice
const deleteInvoice = async (id) => {
    const [result] = await pool.query('DELETE FROM facturas WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

module.exports = {
    selectInvoices,
    selectInvoiceById,
    insertInvoice,
    deleteInvoice,
    selectInvoicesByClient,
    selectInvoiceStats,
}