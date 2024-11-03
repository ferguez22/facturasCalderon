const { selectClientes, selectClienteById, insertCliente, updateCliente, deleteCliente } = require('../models/clientes.models');

const getClientes = async (req, res, next) => {
    try {
        const clientes = await selectClientes();
        if (!clientes || clientes.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron clientes en la base de datos'
            });
        }
        res.json({
            message: 'Clientes encontrados correctamente',
            clientes
        });
    } catch (error) {
        next({
            message: 'Error al obtener los clientes',
            error: error.message
        });
    }
}

const getClienteById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const cliente = await selectClienteById(id);
        res.json({
            message: 'Cliente encontrado correctamente',
            cliente
        });
    } catch (error) {
        next(error);
    }
}

const createCliente = async (req, res, next) => {
    try {
        const { nombre, nif, email, telefono, direccion, ciudad } = req.body;

        // Validar campos requeridos
        if (!nombre || !nif) {
            return res.status(400).json({
                message: 'Los campos nombre y nif son obligatorios',
                required: ['nombre', 'nif']
            });
        }

        // Crear el cliente
        const clienteId = await insertCliente({
            nombre,
            nif: nif.toUpperCase(), // Aseguramos que el NIF esté en mayúsculas
            email: email || null,
            telefono: telefono || null,
            direccion: direccion || null,
            ciudad: ciudad || null
        });

        const nuevoCliente = await selectClienteById(clienteId);

        res.status(201).json({
            message: 'Cliente creado con éxito',
            cliente: nuevoCliente
        });
    } catch (error) {
        next(error);
    }
}

const updateClienteById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await updateCliente(id, req.body);
        res.json({
            message: 'Cliente actualizado correctamente',
            result
        });
    } catch (error) {
        next(error);
    }
}

const deleteClienteById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await deleteCliente(id);
        res.json({
            message: 'Cliente eliminado correctamente',
            result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getClientes,
    getClienteById,
    createCliente,
    updateClienteById,
    deleteClienteById
}