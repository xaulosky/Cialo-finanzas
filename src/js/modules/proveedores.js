// Módulo de Gestión de Proveedores
const ProveedoresModule = (() => {
    let proveedores = [];

    const init = () => {
        document.getElementById('add-proveedor-btn').addEventListener('click', showAddProveedorModal);
    };

    const loadProveedores = async () => {
        window.utils.showLoading();
        try {
            const { data, error } = await supabase
                .from('proveedores')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;

            proveedores = data || [];
            renderProveedores();
        } catch (error) {
            console.error('Error cargando proveedores:', error);
            window.utils.showToast('Error al cargar proveedores', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const renderProveedores = () => {
        const container = document.getElementById('proveedores-list');
        
        if (proveedores.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay proveedores registrados</p>';
            return;
        }

        const activos = proveedores.filter(p => p.activo);

        container.innerHTML = `
            <div class="list-summary">
                <strong>Proveedores activos:</strong> ${activos.length} de ${proveedores.length}
            </div>
            <div class="cards-grid">
                ${proveedores.map(prov => `
                    <div class="provider-card ${!prov.activo ? 'inactive' : ''}">
                        <div class="provider-header">
                            <h4>${prov.nombre}</h4>
                            <span class="badge badge-${prov.activo ? 'success' : 'danger'}">
                                ${prov.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div class="provider-info">
                            ${prov.tipo ? `<p><strong>Tipo:</strong> ${prov.tipo}</p>` : ''}
                            ${prov.ruc ? `<p><strong>RUC:</strong> ${prov.ruc}</p>` : ''}
                            ${prov.contacto ? `<p><strong>Contacto:</strong> ${prov.contacto}</p>` : ''}
                            ${prov.telefono ? `<p><strong>Teléfono:</strong> ${prov.telefono}</p>` : ''}
                            ${prov.email ? `<p><strong>Email:</strong> ${prov.email}</p>` : ''}
                            ${prov.direccion ? `<p><strong>Dirección:</strong> ${prov.direccion}</p>` : ''}
                        </div>
                        <div class="provider-actions">
                            <button class="btn btn-sm btn-primary" onclick="window.ProveedoresModule.viewTransacciones('${prov.id}')">
                                Ver Transacciones
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="window.ProveedoresModule.editProveedor('${prov.id}')">
                                Editar
                            </button>
                            <button class="btn btn-sm ${prov.activo ? 'btn-danger' : 'btn-success'}" 
                                    onclick="window.ProveedoresModule.toggleProveedorStatus('${prov.id}')">
                                ${prov.activo ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    };

    const showAddProveedorModal = () => {
        showModal('Nuevo Proveedor', `
            <form id="proveedor-form">
                <div class="form-group">
                    <label for="prov-nombre">Nombre *</label>
                    <input type="text" id="prov-nombre" required>
                </div>
                <div class="form-group">
                    <label for="prov-tipo">Tipo</label>
                    <select id="prov-tipo">
                        <option value="">Seleccionar...</option>
                        <option value="medicamentos">Medicamentos</option>
                        <option value="equipos">Equipos Médicos</option>
                        <option value="insumos">Insumos</option>
                        <option value="servicios">Servicios</option>
                        <option value="limpieza">Limpieza</option>
                        <option value="otros">Otros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="prov-ruc">RUC</label>
                    <input type="text" id="prov-ruc">
                </div>
                <div class="form-group">
                    <label for="prov-contacto">Persona de Contacto</label>
                    <input type="text" id="prov-contacto">
                </div>
                <div class="form-group">
                    <label for="prov-telefono">Teléfono</label>
                    <input type="tel" id="prov-telefono">
                </div>
                <div class="form-group">
                    <label for="prov-email">Email</label>
                    <input type="email" id="prov-email">
                </div>
                <div class="form-group">
                    <label for="prov-direccion">Dirección</label>
                    <textarea id="prov-direccion" rows="2"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('proveedor-form').addEventListener('submit', saveProveedor);
    };

    const saveProveedor = async (e) => {
        e.preventDefault();
        window.utils.showLoading();

        const proveedorData = {
            nombre: document.getElementById('prov-nombre').value,
            tipo: document.getElementById('prov-tipo').value,
            ruc: document.getElementById('prov-ruc').value,
            contacto: document.getElementById('prov-contacto').value,
            telefono: document.getElementById('prov-telefono').value,
            email: document.getElementById('prov-email').value,
            direccion: document.getElementById('prov-direccion').value,
            activo: true
        };

        try {
            const { error } = await supabase
                .from('proveedores')
                .insert([proveedorData]);

            if (error) throw error;

            window.utils.showToast('Proveedor registrado exitosamente', 'success');
            window.closeModal();
            loadProveedores();
        } catch (error) {
            console.error('Error guardando proveedor:', error);
            window.utils.showToast('Error al guardar proveedor', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const editProveedor = async (id) => {
        const proveedor = proveedores.find(p => p.id === id);
        if (!proveedor) return;

        showModal('Editar Proveedor', `
            <form id="proveedor-edit-form">
                <div class="form-group">
                    <label for="edit-prov-nombre">Nombre *</label>
                    <input type="text" id="edit-prov-nombre" required value="${proveedor.nombre}">
                </div>
                <div class="form-group">
                    <label for="edit-prov-tipo">Tipo</label>
                    <select id="edit-prov-tipo">
                        <option value="">Seleccionar...</option>
                        <option value="medicamentos" ${proveedor.tipo === 'medicamentos' ? 'selected' : ''}>Medicamentos</option>
                        <option value="equipos" ${proveedor.tipo === 'equipos' ? 'selected' : ''}>Equipos Médicos</option>
                        <option value="insumos" ${proveedor.tipo === 'insumos' ? 'selected' : ''}>Insumos</option>
                        <option value="servicios" ${proveedor.tipo === 'servicios' ? 'selected' : ''}>Servicios</option>
                        <option value="limpieza" ${proveedor.tipo === 'limpieza' ? 'selected' : ''}>Limpieza</option>
                        <option value="otros" ${proveedor.tipo === 'otros' ? 'selected' : ''}>Otros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-prov-ruc">RUC</label>
                    <input type="text" id="edit-prov-ruc" value="${proveedor.ruc || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-prov-contacto">Persona de Contacto</label>
                    <input type="text" id="edit-prov-contacto" value="${proveedor.contacto || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-prov-telefono">Teléfono</label>
                    <input type="tel" id="edit-prov-telefono" value="${proveedor.telefono || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-prov-email">Email</label>
                    <input type="email" id="edit-prov-email" value="${proveedor.email || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-prov-direccion">Dirección</label>
                    <textarea id="edit-prov-direccion" rows="2">${proveedor.direccion || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Actualizar</button>
                </div>
            </form>
        `);

        document.getElementById('proveedor-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            window.utils.showLoading();

            const updatedData = {
                nombre: document.getElementById('edit-prov-nombre').value,
                tipo: document.getElementById('edit-prov-tipo').value,
                ruc: document.getElementById('edit-prov-ruc').value,
                contacto: document.getElementById('edit-prov-contacto').value,
                telefono: document.getElementById('edit-prov-telefono').value,
                email: document.getElementById('edit-prov-email').value,
                direccion: document.getElementById('edit-prov-direccion').value
            };

            try {
                const { error } = await supabase
                    .from('proveedores')
                    .update(updatedData)
                    .eq('id', id);

                if (error) throw error;

                window.utils.showToast('Proveedor actualizado exitosamente', 'success');
                window.closeModal();
                loadProveedores();
            } catch (error) {
                console.error('Error actualizando proveedor:', error);
                window.utils.showToast('Error al actualizar proveedor', 'error');
            } finally {
                window.utils.hideLoading();
            }
        });
    };

    const toggleProveedorStatus = async (id) => {
        const proveedor = proveedores.find(p => p.id === id);
        if (!proveedor) return;

        const newStatus = !proveedor.activo;
        const action = newStatus ? 'activar' : 'desactivar';

        if (!confirm(`¿Está seguro de ${action} a este proveedor?`)) return;

        window.utils.showLoading();
        try {
            const { error } = await supabase
                .from('proveedores')
                .update({ activo: newStatus })
                .eq('id', id);

            if (error) throw error;

            window.utils.showToast(`Proveedor ${action}do exitosamente`, 'success');
            loadProveedores();
        } catch (error) {
            console.error('Error actualizando estado:', error);
            window.utils.showToast('Error al actualizar estado', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const viewTransacciones = async (proveedorId) => {
        const proveedor = proveedores.find(p => p.id === proveedorId);
        if (!proveedor) return;

        window.utils.showLoading();
        try {
            const { data, error } = await supabase
                .from('transacciones_proveedores')
                .select('*')
                .eq('proveedor_id', proveedorId)
                .order('fecha', { ascending: false });

            if (error) throw error;

            const transacciones = data || [];
            const total = transacciones.reduce((sum, t) => sum + parseFloat(t.monto), 0);

            showModal(`Transacciones - ${proveedor.nombre}`, `
                <div class="transacciones-header">
                    <button class="btn btn-primary btn-sm" onclick="window.ProveedoresModule.addTransaccion('${proveedorId}')">
                        + Nueva Transacción
                    </button>
                    <div class="list-summary">
                        <strong>Total:</strong> ${window.utils.formatCurrency(total)}
                    </div>
                </div>
                ${transacciones.length === 0 ? 
                    '<p class="empty-state">No hay transacciones registradas</p>' :
                    `<div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Descripción</th>
                                    <th>Monto</th>
                                    <th>Comprobante</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transacciones.map(trans => `
                                    <tr>
                                        <td>${window.utils.formatDate(trans.fecha)}</td>
                                        <td><span class="badge badge-${trans.tipo}">${trans.tipo}</span></td>
                                        <td>${trans.descripcion || '-'}</td>
                                        <td class="amount">${window.utils.formatCurrency(trans.monto)}</td>
                                        <td>${trans.comprobante || '-'}</td>
                                        <td class="actions">
                                            <button class="btn-icon" onclick="window.ProveedoresModule.deleteTransaccion('${trans.id}', '${proveedorId}')">🗑️</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`
                }
            `);
        } catch (error) {
            console.error('Error cargando transacciones:', error);
            window.utils.showToast('Error al cargar transacciones', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const addTransaccion = (proveedorId) => {
        const proveedor = proveedores.find(p => p.id === proveedorId);
        if (!proveedor) return;

        const today = new Date().toISOString().slice(0, 10);

        showModal(`Nueva Transacción - ${proveedor.nombre}`, `
            <form id="transaccion-form">
                <div class="form-group">
                    <label for="trans-fecha">Fecha *</label>
                    <input type="date" id="trans-fecha" required value="${today}">
                </div>
                <div class="form-group">
                    <label for="trans-tipo">Tipo *</label>
                    <select id="trans-tipo" required>
                        <option value="compra">Compra</option>
                        <option value="pago">Pago</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="trans-descripcion">Descripción</label>
                    <textarea id="trans-descripcion" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="trans-monto">Monto *</label>
                    <input type="number" id="trans-monto" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="trans-comprobante">Comprobante</label>
                    <input type="text" id="trans-comprobante">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.ProveedoresModule.viewTransacciones('${proveedorId}')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('transaccion-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            window.utils.showLoading();

            const transData = {
                proveedor_id: proveedorId,
                fecha: document.getElementById('trans-fecha').value,
                tipo: document.getElementById('trans-tipo').value,
                descripcion: document.getElementById('trans-descripcion').value,
                monto: parseFloat(document.getElementById('trans-monto').value),
                comprobante: document.getElementById('trans-comprobante').value
            };

            try {
                const { error } = await supabase
                    .from('transacciones_proveedores')
                    .insert([transData]);

                if (error) throw error;

                window.utils.showToast('Transacción registrada exitosamente', 'success');
                viewTransacciones(proveedorId);
            } catch (error) {
                console.error('Error guardando transacción:', error);
                window.utils.showToast('Error al guardar transacción', 'error');
            } finally {
                window.utils.hideLoading();
            }
        });
    };

    const deleteTransaccion = async (transId, proveedorId) => {
        if (!confirm('¿Está seguro de eliminar esta transacción?')) return;

        window.utils.showLoading();
        try {
            const { error } = await supabase
                .from('transacciones_proveedores')
                .delete()
                .eq('id', transId);

            if (error) throw error;

            window.utils.showToast('Transacción eliminada exitosamente', 'success');
            viewTransacciones(proveedorId);
        } catch (error) {
            console.error('Error eliminando transacción:', error);
            window.utils.showToast('Error al eliminar transacción', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const showModal = (title, body) => {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = body;
        document.getElementById('modal').style.display = 'flex';
    };

    return {
        init,
        loadProveedores,
        editProveedor,
        toggleProveedorStatus,
        viewTransacciones,
        addTransaccion,
        deleteTransaccion
    };
})();

window.ProveedoresModule = ProveedoresModule;
