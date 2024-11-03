// Facturas


async function mostrarModalPrecioMetroCuadrado() {
    const { precio } = await api.getPrecioMetroCuadrado();

    const modal = `
        <div class="modal fade" id="precioModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Configurar Precio por Metro Cuadrado</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="formPrecioMetroCuadrado" onsubmit="actualizarPrecioMetroCuadrado(event)">
                            <div class="mb-3">
                                <label class="form-label">Precio por Metro Cuadrado (€)</label>
                                <input type="number" class="form-control" name="precio" 
                                       step="0.01" min="0.01" required 
                                       value="${precio}">
                            </div>
                            <div class="text-end">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modal);

    // Mostrar modal
    const modalElement = new bootstrap.Modal(document.getElementById('precioModal'));
    modalElement.show();

    // Limpiar modal al cerrar
    document.getElementById('precioModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

async function actualizarPrecioMetroCuadrado(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const precio = Number(formData.get('precio'));

    try {
        await api.updatePrecioMetroCuadrado(precio);
        alert('Precio actualizado correctamente');
        bootstrap.Modal.getInstance(document.getElementById('precioModal')).hide();
    } catch (error) {
        alert('Error al actualizar el precio: ' + error.message);
    }
}

async function mostrarNuevaFactura(clienteId = null) {
    const contenido = document.getElementById('contenido-principal');
    const { clientes } = await api.obtenerClientes();

    contenido.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Nueva Factura</h3>
            </div>
            <div class="card-body">
                <form id="formularioFactura" onsubmit="guardarFactura(event)">
                    <!-- Si viene un clienteId, lo guardamos en un campo oculto -->
                    ${clienteId ? `<input type="hidden" name="cliente_id" value="${clienteId}">` : ''}
                    
                    <div class="mb-3">
                        <label class="form-label">Cliente</label>
                        <select class="form-select" name="cliente_id" ${clienteId ? 'disabled' : 'required'}>
                            <option value="">Seleccione un cliente</option>
                            ${clientes.map(cliente => `
                                <option value="${cliente.id}" ${cliente.id === clienteId ? 'selected' : ''}>
                                    ${cliente.nombre} - ${cliente.NIF}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div id="items-container">
                        <h4 class="mb-3">Items de la Factura</h4>
                        <div class="item-row mb-3 p-3 border rounded">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Descripción</label>
                                    <input type="text" class="form-control" 
                                           name="items[0][descripcion]" required>
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Largo (mm)</label>
                                    <input type="number" class="form-control" 
                                           name="items[0][largo_mm]" required min="1">
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Ancho (mm)</label>
                                    <input type="number" class="form-control" 
                                           name="items[0][ancho_mm]" required min="1">
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Unidades</label>
                                    <input type="number" class="form-control" 
                                           name="items[0][unidades]" required min="1">
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="button" class="btn btn-secondary mb-3" onclick="agregarItem()">
                        <i class="bi bi-plus-circle"></i> Agregar Otro Item
                    </button>

                    <div class="text-end mt-4">
                        <button type="button" class="btn btn-secondary me-2" onclick="mostrarFacturas()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Crear Factura
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

let itemCount = 1;

function agregarItem() {
    const container = document.getElementById('items-container');
    const newItem = document.createElement('div');
    newItem.className = 'item-row mb-3 p-3 border rounded';
    newItem.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label">Descripción</label>
                <input type="text" class="form-control" 
                       name="items[${itemCount}][descripcion]" required>
            </div>
            <div class="col-md-2">
                <label class="form-label">Largo (mm)</label>
                <input type="number" class="form-control" 
                       name="items[${itemCount}][largo_mm]" 
                       step="0.01"  <!-- Agregado step para decimales -->
                       required min="0.01">
            </div>
            <div class="col-md-2">
                <label class="form-label">Ancho (mm)</label>
                <input type="number" class="form-control" 
                       name="items[${itemCount}][ancho_mm]" 
                       step="0.01"  <!-- Agregado step para decimales -->
                       required min="0.01">
            </div>
            <div class="col-md-2">
                <label class="form-label">Unidades</label>
                <input type="number" class="form-control" 
                       name="items[${itemCount}][unidades]" required min="1">
            </div>
        </div>
    `;
    container.appendChild(newItem);
    itemCount++;
}

async function guardarFactura(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Procesar items
    const items = [];
    const rawData = Object.fromEntries(formData.entries());

    // Obtener cliente_id
    const cliente_id = Number(formData.get('cliente_id'));

    // Generar número de factura (puedes ajustar este formato según necesites)
    const numero_factura = `F${new Date().getFullYear()}${String(Date.now()).slice(-4)}`;

    // Validar que hay un cliente seleccionado
    if (!cliente_id) {
        alert('Por favor, seleccione un cliente');
        return;
    }

    // Procesar cada item
    for (let i = 0; i < itemCount; i++) {
        if (rawData[`items[${i}][descripcion]`]) {
            const item = {
                descripcion: rawData[`items[${i}][descripcion]`],
                largo_mm: Number(rawData[`items[${i}][largo_mm]`]),
                ancho_mm: Number(rawData[`items[${i}][ancho_mm]`]),
                unidades: Number(rawData[`items[${i}][unidades]`])
            };

            // Validar que todos los campos numéricos son válidos
            if (item.largo_mm <= 0 || item.ancho_mm <= 0 || item.unidades <= 0) {
                alert('Todos los valores numéricos deben ser mayores a 0');
                return;
            }

            items.push(item);
        }
    }

    // Validar que hay al menos un item
    if (items.length === 0) {
        alert('Debe agregar al menos un item a la factura');
        return;
    }

    const factura = {
        cliente_id,
        numero_factura,  // Agregado el número de factura
        descripcion: 'Factura de muebles', // Descripción por defecto
        items
    };

    console.log('Datos de factura a enviar:', factura); // Para debug

    try {
        const response = await api.crearFactura(factura);
        if (response.error) {
            throw new Error(response.error);
        }
        alert('Factura creada con éxito');
        mostrarFacturas();
    } catch (error) {
        alert('Error al guardar la factura: ' + error.message);
        console.error('Error completo:', error);
    }
}

async function mostrarFacturas() {
    const contenido = document.getElementById('contenido-principal');
    try {
        const { facturas } = await api.obtenerFacturas();

        console.log('Facturas recibidas:', facturas); // Para debug

        contenido.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Facturas</h2>
                <button class="btn btn-primary" onclick="mostrarNuevaFactura()">
                    <i class="bi bi-plus-circle"></i> Nueva Factura
                </button>
            </div>
            
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Nº Factura</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Total Items</th>
                            <th>Total M²</th>
                            <th>Total €</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${facturas.map(factura => {
            // Convertir valores a números y validar
            const totalMetrosCuadrados = Number(factura.total_metros_cuadrados) || 0;
            const totalEuros = Number(factura.total) || 0;
            const totalItems = factura.total_items || 0; // Nuevo campo desde el backend

            return `
                                <tr>
                                    <td>${factura.numero_factura}</td>
                                    <td>${factura.cliente_nombre}</td>
                                    <td>${new Date(factura.fecha).toLocaleDateString()}</td>
                                    <td>${totalItems}</td>
                                    <td>${totalMetrosCuadrados.toFixed(2)}</td>
                                    <td>${totalEuros.toFixed(2)}€</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-info" onclick="verFactura(${factura.id})">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarFactura(${factura.id})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        contenido.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar las facturas: ${error.message}
            </div>
        `;
        console.error('Error completo:', error);
    }
}

async function verFactura(id) {
    const contenido = document.getElementById('contenido-principal');
    try {
        const response = await fetch(`${API_URL}/facturas/${id}`);
        const { factura } = await response.json();

        console.log('Detalle de factura recibido:', factura); // Para debug

        contenido.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h3>Factura ${factura.numero_factura || 'N/A'}</h3>
                    <div>
                        <button class="btn btn-primary me-2" onclick="exportarFacturaPDF(${id})">
                            <i class="bi bi-file-pdf"></i> Exportar PDF
                        </button>
                        <button class="btn btn-secondary" onclick="mostrarFacturas()">
                            <i class="bi bi-arrow-left"></i> Volver
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h5>Cliente</h5>
                            <p>${factura.cliente_nombre || 'N/A'}</p>
                            <p>NIF: ${factura.NIF || 'N/A'}</p>
                            <p>Dirección: ${factura.direccion || 'N/A'}</p>
                            <p>Email: ${factura.email || 'N/A'}</p>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <h5>Fecha</h5>
                            <p>${new Date(factura.fecha).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Largo (mm)</th>
                                    <th>Ancho (mm)</th>
                                    <th>M² por pieza</th>
                                    <th>€/M²</th>
                                    <th>Precio por pieza</th>
                                    <th>Unidades</th>
                                    <th>Total M²</th>
                                    <th>Total €</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${factura.items.map(item => `
                                    <tr>
                                        <td>${item.descripcion}</td>
                                        <td>${Number(item.largo_mm).toFixed(0)}</td>
                                        <td>${Number(item.ancho_mm).toFixed(0)}</td>
                                        <td>${Number(item.metros_cuadrados).toFixed(2)}</td>
                                        <td>${Number(item.precio_metro_cuadrado).toFixed(2)}</td>
                                        <td>${Number(item.precio_pieza).toFixed(2)}</td>
                                        <td>${item.unidades}</td>
                                        <td>${Number(item.total_metros_cuadrados).toFixed(2)}</td>
                                        <td>${Number(item.total).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="table-dark">
                                    <td colspan="7" class="text-end">Subtotal:</td>
                                    <td colspan="2">${Number(factura.subtotal).toFixed(2)}€</td>
                                </tr>
                                <tr class="table-dark">
                                    <td colspan="7" class="text-end">IVA (21%):</td>
                                    <td colspan="2">${Number(factura.iva).toFixed(2)}€</td>
                                </tr>
                                <tr class="table-dark">
                                    <td colspan="7" class="text-end"><strong>Total:</strong></td>
                                    <td colspan="2"><strong>${Number(factura.total).toFixed(2)}€</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        contenido.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar el detalle de la factura: ${error.message}
            </div>
        `;
        console.error('Error completo:', error);
    }
}
async function eliminarFactura(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta factura?')) {
        return;
    }

    try {
        await fetch(`${API_URL}/facturas/${id}`, {
            method: 'DELETE'
        });
        mostrarFacturas();
    } catch (error) {
        alert('Error al eliminar la factura: ' + error.message);
    }
}

async function exportarFacturaPDF(id) {
    try {
        const response = await fetch(`${API_URL}/facturas/${id}`);
        const { factura } = await response.json();

        const contenidoFactura = `
        <div class="factura-pdf" style="padding: 20px; font-family: Arial, sans-serif;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <!-- Datos del emisor (izquierda) -->
                <div style="text-align: left; flex: 1;">
                    <p style="margin: 0;"><strong>GUSTAVO A CALDERON GUTIERREZ</strong></p>
                    <p style="margin: 0;">Z0403923W</p>
                    <p style="margin: 0;">Avda. Huertas del Sacramento, portal 25, 3D</p>
                    <p style="margin: 0;">24402 Ponferrada (León)</p>
                    <p style="margin: 0;">TLF 613066396</p>
                    <p style="margin: 0;">tapizeriacalderon@gmail.com</p>
                </div>

                <!-- Datos de factura (derecha) -->
                <div style="text-align: right; flex: 1;">
                    <p style="margin: 0;"><strong>Nº Factura:</strong> ${factura.numero_factura}</p>
                    <p style="margin: 0; margin-bottom: 30px;"><strong>Fecha:</strong> ${new Date(factura.fecha).toLocaleDateString()}</p>
                    
                    <p style="margin: 0;"><strong>Nombre:</strong> ${factura.cliente_nombre}</p>
                    <p style="margin: 0;"><strong>NIF:</strong> ${factura.NIF}</p>
                    <p style="margin: 0;"><strong>Dirección:</strong> ${factura.direccion || 'N/A'}</p>
                    <p style="margin: 0;"><strong>Email:</strong> ${factura.email || 'N/A'}</p>
                </div>
            </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ddd; padding: 6px;">Descripción</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Largo (mm)</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Ancho (mm)</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">M² por pieza</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">€/M²</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Precio pieza</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">UDS</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Total M²</th>
                            <th style="border: 1px solid #ddd; padding: 6px;">Total €</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${factura.items.map(item => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 6px;">${item.descripcion}</td>
                                <td style="border: 1px solid #ddd; padding: 6px;">${Number(item.largo_mm).toFixed(0)}</td>
                                <td style="border: 1px solid #ddd; padding: 6px;">${Number(item.ancho_mm).toFixed(0)}</td>
                                <td style="border: 1px solid #ddd; padding: 6px;">${Number(item.metros_cuadrados).toFixed(2)}</td>
                                <td style="border: 1px solid #ddd; padding: 6px;">${Number(item.precio_metro_cuadrado).toFixed(2)}</td>
                                <td style="border: 1px solid #ddd; padding: 6px;">${Number(item.precio_pieza).toFixed(2)}</td>
                                <td style="border: 1px solid #ddd; padding: 6px;">${item.unidades}</td>
                                <td style="border: 1px solid #ddd; padding: 6px;">${Number(item.total_metros_cuadrados).toFixed(2)}</td>
                                <td style="border: 1px solid #ddd; padding: 6px;">${Number(item.total).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="text-align: right; margin-top: 20px;">
                    <p><strong>Subtotal:</strong> ${Number(factura.subtotal).toFixed(2)}€</p>
                    <p><strong>IVA (21%):</strong> ${Number(factura.iva).toFixed(2)}€</p>
                    <p style="font-size: 1.2em;"><strong>Total Final:</strong> ${Number(factura.total).toFixed(2)}€</p>
                </div>
            </div>
        `;

        const opt = {
            margin: 1,
            filename: `factura_${factura.numero_factura}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
        };

        const element = document.createElement('div');
        element.innerHTML = contenidoFactura;
        document.body.appendChild(element);

        try {
            await html2pdf().set(opt).from(element).save();
        } finally {
            document.body.removeChild(element);
        }

    } catch (error) {
        console.error('Error al exportar la factura:', error);
        alert('Error al exportar la factura a PDF');
    }
}

