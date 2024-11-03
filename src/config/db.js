//  CONFIGURACIÓN DE LA BASE DE DATOS  //

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'rootfernando',
    port: 3306,
    database: 'facturasCalderon'
});

module.exports = pool.promise();