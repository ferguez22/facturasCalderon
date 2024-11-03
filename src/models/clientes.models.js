const pool = require('../config/db');

const selectClientes = async () => {
    const [rows] = await pool.query('SELECT * FROM clientes');
    return rows;
};

const selectClienteById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
    return rows[0];
};

const insertCliente = async (cliente) => {
    const [result] = await pool.query('INSERT INTO clientes (nombre, NIF, direccion, ciudad, telefono, email) VALUES (?, ?, ?, ?, ?, ?)', [cliente.nombre, cliente.nif.toUpperCase(), cliente.direccion, cliente.ciudad, cliente.telefono, cliente.email]);
    return result.insertId;
};

const updateCliente = async (id, cliente) => {
    const [result] = await pool.query('UPDATE clientes SET nombre = ?, direccion = ?, telefono = ? WHERE id = ?', [cliente.nombre, cliente.direccion, cliente.telefono, id]);
    return result.affectedRows;
};

const deleteCliente = async (id) => {
    const [result] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
    return result.affectedRows;
};


module.exports = {
    selectClientes,
    selectClienteById,
    insertCliente,
    updateCliente,
    deleteCliente
};