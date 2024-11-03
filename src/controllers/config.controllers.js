const { updatePrecio, getPrecio } = require('../models/config.models');

const getPrecioMetroCuadrado = async (req, res, next) => {
    try {
        const precio = await getPrecio();
        res.json({ precio });
    } catch (error) {
        next(error);
    }
};

const updatePrecioMetroCuadrado = async (req, res, next) => {
    try {
        const { precio } = req.body;
        if (!precio || isNaN(precio) || precio <= 0) {
            return res.status(400).json({
                message: 'El precio debe ser un número válido mayor que 0'
            });
        }
        await updatePrecio(precio);
        res.json({
            message: 'Precio actualizado correctamente',
            precio
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPrecioMetroCuadrado,
    updatePrecioMetroCuadrado
}; 