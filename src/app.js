// Creation and configuration of the Express APP
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());



// Servir archivos estáticos
app.use(express.static('public'));

// Route configuration
app.use('/api', require('./routes/api.routes'));


// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json(err);
})

module.exports = app;