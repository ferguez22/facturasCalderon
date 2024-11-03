async function mostrarClientes() {
    const contenido = document.getElementById('contenido-principal');
    try {
        const { clientes } = await api.obtenerClientes();
        console.log('Clientes recibidos:', clientes);

        contenido.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Clientes</h2>
                <button class="btn btn-primary" onclick="mostrarFormularioCliente()">
                    <i class="bi bi-plus-circle"></i> Nuevo Cliente
                </button>
            </div>
            
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Nombre</th>
                            <th>NIF</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientes.map(cliente => `
                            <tr>
                                <td>${cliente.nombre}</td>
                                <td>${cliente.NIF}</td>
                                <td>${cliente.email || ''}</td>
                                <td>${cliente.telefono || ''}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="crearFacturaParaCliente(${cliente.id})">
                                        <i class="bi bi-file-plus"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        contenido.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar los clientes: ${error.message}
            </div>
        `;
    }
}

function mostrarFormularioCliente() {
    const contenido = document.getElementById('contenido-principal');
    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Nuevo Cliente</h3>
            </div>
            <div class="card-body">
                <form onsubmit="guardarCliente(event)">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nombre *</label>
                            <input type="text" class="form-control" name="nombre" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">NIF *</label>
                            <input type="text" class="form-control" name="nif" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" name="email">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Teléfono</label>
                            <input type="tel" class="form-control" name="telefono">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Dirección</label>
                            <input type="text" class="form-control" name="direccion">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Ciudad</label>
                            <input type="text" class="form-control" name="ciudad">
                        </div>
                    </div>
                    <div class="text-end">
                        <button type="button" class="btn btn-secondary me-2" onclick="mostrarClientes()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Guardar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

async function guardarCliente(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Crear objeto cliente asegurándonos de que todos los campos requeridos estén presentes
    const cliente = {
        nombre: formData.get('nombre'),
        nif: formData.get('nif'),         // Asegúrate de que el campo se llama 'nif' y no 'NIF'
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        direccion: formData.get('direccion') || '',
        ciudad: formData.get('ciudad') || ''
    };

    // Validar que los campos requeridos no estén vacíos
    if (!cliente.nombre || !cliente.nif) {
        alert('Los campos Nombre y NIF son obligatorios');
        return;
    }

    try {
        const response = await api.crearCliente(cliente);
        if (response.error) {
            throw new Error(response.error);
        }
        alert('Cliente guardado con éxito');
        mostrarClientes();
    } catch (error) {
        alert('Error al guardar el cliente: ' + error.message);
        console.error('Error completo:', error);
    }
}

function crearFacturaParaCliente(clienteId) {
    mostrarNuevaFactura(clienteId);
} 