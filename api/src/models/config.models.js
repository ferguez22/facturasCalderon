const pool = require('../config/db');

const getPrecio = async () => {
    const [rows] = await pool.query('SELECT valor FROM configuracion WHERE clave = "PRECIO_METRO_CUADRADO"');
    return rows[0]?.valor || 116.11; // Valor por defecto
};

const updatePrecio = async (precio) => {
    await pool.query(
        'INSERT INTO configuracion (clave, valor) VALUES ("PRECIO_METRO_CUADRADO", ?) ON DUPLICATE KEY UPDATE valor = ?',
        [precio, precio]
    );
    return precio;
};

module.exports = {
    getPrecio,
    updatePrecio
}; 