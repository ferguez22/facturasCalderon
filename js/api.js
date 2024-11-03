const API_URL = 'http://localhost:3000/api';

const api = {
    // Clientes
    async obtenerClientes() {
        const response = await fetch(`${API_URL}/clientes`);
        return await response.json();
    },

    async crearCliente(cliente) {
        const response = await fetch(`${API_URL}/clientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });
        return await response.json();
    },

    // Facturas
    async obtenerFacturas() {
        const response = await fetch(`${API_URL}/facturas`);
        return await response.json();
    },

    async crearFactura(factura) {
        try {
            const response = await fetch(`${API_URL}/facturas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(factura)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear la factura');
            }

            return data;
        } catch (error) {
            console.error('Error en API crearFactura:', error);
            throw error;
        }
    },

    async getPrecioMetroCuadrado() {
        try {
            const response = await fetch(`${API_URL}/configuracion/precio-metro-cuadrado`);
            return await response.json();
        } catch (error) {
            console.error('Error en API getPrecioMetroCuadrado:', error);
            throw error;
        }
    },

    async updatePrecioMetroCuadrado(precio) {
        try {
            const response = await fetch(`${API_URL}/configuracion/precio-metro-cuadrado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ precio })
            });
            return await response.json();
        } catch (error) {
            console.error('Error en API updatePrecioMetroCuadrado:', error);
            throw error;
        }
    }
}; 