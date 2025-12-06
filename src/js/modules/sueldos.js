// Módulo de Gestión de Sueldos
const SueldosModule = (() => {
    let empleados = [];
    let pagos = [];

    const init = () => {
        document.getElementById('add-empleado-btn').addEventListener('click', showAddEmpleadoModal);
        document.getElementById('add-pago-btn').addEventListener('click', showAddPagoModal);
        
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                switchTab(tabName);
            });
        });

        // Filtros
        document.getElementById('filter-empleado-pago').addEventListener('change', loadPagos);
        document.getElementById('filter-mes-pago').addEventListener('change', loadPagos);

        // Establecer mes actual
        const today = new Date();
        const currentMonth = today.toISOString().slice(0, 7);
        document.getElementById('filter-mes-pago').value = currentMonth;
    };

    const switchTab = (tabName) => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        if (tabName === 'empleados') {
            loadEmpleados();
        } else if (tabName === 'pagos') {
            loadPagos();
        }
    };

    const loadEmpleados = async () => {
        window.utils.showLoading();
        try {
            const { data, error } = await supabase
                .from('empleados')
                .select('*')
                .order('nombre_completo', { ascending: true });

            if (error) throw error;

            empleados = data || [];
            renderEmpleados();
            updateEmpleadoFilter();
        } catch (error) {
            console.error('Error cargando empleados:', error);
            window.utils.showToast('Error al cargar empleados', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const renderEmpleados = () => {
        const container = document.getElementById('empleados-list');
        
        if (empleados.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay empleados registrados</p>';
            return;
        }

        const activos = empleados.filter(e => e.activo);
        const totalSalarios = activos.reduce((sum, emp) => sum + parseFloat(emp.salario_mensual), 0);

        container.innerHTML = `
            <div class="list-summary">
                <strong>Empleados activos:</strong> ${activos.length} | 
                <strong>Total nómina mensual:</strong> ${window.utils.formatCurrency(totalSalarios)}
            </div>
            <div class="cards-grid">
                ${empleados.map(emp => `
                    <div class="employee-card ${!emp.activo ? 'inactive' : ''}">
                        <div class="employee-header">
                            <h4>${emp.nombre_completo}</h4>
                            <span class="badge badge-${emp.activo ? 'success' : 'danger'}">
                                ${emp.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div class="employee-info">
                            <p><strong>Cargo:</strong> ${emp.cargo}</p>
                            <p><strong>Salario:</strong> ${window.utils.formatCurrency(emp.salario_mensual)}</p>
                            <p><strong>Fecha de ingreso:</strong> ${window.utils.formatDate(emp.fecha_ingreso)}</p>
                            ${emp.email ? `<p><strong>Email:</strong> ${emp.email}</p>` : ''}
                            ${emp.telefono ? `<p><strong>Teléfono:</strong> ${emp.telefono}</p>` : ''}
                        </div>
                        <div class="employee-actions">
                            <button class="btn btn-sm btn-secondary" onclick="window.SueldosModule.editEmpleado('${emp.id}')">Editar</button>
                            <button class="btn btn-sm ${emp.activo ? 'btn-danger' : 'btn-success'}" 
                                    onclick="window.SueldosModule.toggleEmpleadoStatus('${emp.id}')">
                                ${emp.activo ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    };

    const showAddEmpleadoModal = () => {
        const today = new Date().toISOString().slice(0, 10);
        showModal('Nuevo Empleado', `
            <form id="empleado-form">
                <div class="form-group">
                    <label for="emp-nombre">Nombre Completo *</label>
                    <input type="text" id="emp-nombre" required>
                </div>
                <div class="form-group">
                    <label for="emp-cargo">Cargo *</label>
                    <input type="text" id="emp-cargo" required placeholder="Ej: Médico, Enfermera, Recepcionista">
                </div>
                <div class="form-group">
                    <label for="emp-salario">Salario Mensual *</label>
                    <input type="number" id="emp-salario" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="emp-fecha">Fecha de Ingreso *</label>
                    <input type="date" id="emp-fecha" required value="${today}">
                </div>
                <div class="form-group">
                    <label for="emp-email">Email</label>
                    <input type="email" id="emp-email">
                </div>
                <div class="form-group">
                    <label for="emp-telefono">Teléfono</label>
                    <input type="tel" id="emp-telefono">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('empleado-form').addEventListener('submit', saveEmpleado);
    };

    const saveEmpleado = async (e) => {
        e.preventDefault();
        window.utils.showLoading();

        const empleadoData = {
            nombre_completo: document.getElementById('emp-nombre').value,
            cargo: document.getElementById('emp-cargo').value,
            salario_mensual: parseFloat(document.getElementById('emp-salario').value),
            fecha_ingreso: document.getElementById('emp-fecha').value,
            email: document.getElementById('emp-email').value,
            telefono: document.getElementById('emp-telefono').value,
            activo: true
        };

        try {
            const { error } = await supabase
                .from('empleados')
                .insert([empleadoData]);

            if (error) throw error;

            window.utils.showToast('Empleado registrado exitosamente', 'success');
            window.closeModal();
            loadEmpleados();
        } catch (error) {
            console.error('Error guardando empleado:', error);
            window.utils.showToast('Error al guardar empleado', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const editEmpleado = async (id) => {
        const empleado = empleados.find(e => e.id === id);
        if (!empleado) return;

        showModal('Editar Empleado', `
            <form id="empleado-edit-form">
                <div class="form-group">
                    <label for="edit-emp-nombre">Nombre Completo *</label>
                    <input type="text" id="edit-emp-nombre" required value="${empleado.nombre_completo}">
                </div>
                <div class="form-group">
                    <label for="edit-emp-cargo">Cargo *</label>
                    <input type="text" id="edit-emp-cargo" required value="${empleado.cargo}">
                </div>
                <div class="form-group">
                    <label for="edit-emp-salario">Salario Mensual *</label>
                    <input type="number" id="edit-emp-salario" step="0.01" min="0" required value="${empleado.salario_mensual}">
                </div>
                <div class="form-group">
                    <label for="edit-emp-fecha">Fecha de Ingreso *</label>
                    <input type="date" id="edit-emp-fecha" required value="${empleado.fecha_ingreso}">
                </div>
                <div class="form-group">
                    <label for="edit-emp-email">Email</label>
                    <input type="email" id="edit-emp-email" value="${empleado.email || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-emp-telefono">Teléfono</label>
                    <input type="tel" id="edit-emp-telefono" value="${empleado.telefono || ''}">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Actualizar</button>
                </div>
            </form>
        `);

        document.getElementById('empleado-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            window.utils.showLoading();

            const updatedData = {
                nombre_completo: document.getElementById('edit-emp-nombre').value,
                cargo: document.getElementById('edit-emp-cargo').value,
                salario_mensual: parseFloat(document.getElementById('edit-emp-salario').value),
                fecha_ingreso: document.getElementById('edit-emp-fecha').value,
                email: document.getElementById('edit-emp-email').value,
                telefono: document.getElementById('edit-emp-telefono').value
            };

            try {
                const { error } = await supabase
                    .from('empleados')
                    .update(updatedData)
                    .eq('id', id);

                if (error) throw error;

                window.utils.showToast('Empleado actualizado exitosamente', 'success');
                window.closeModal();
                loadEmpleados();
            } catch (error) {
                console.error('Error actualizando empleado:', error);
                window.utils.showToast('Error al actualizar empleado', 'error');
            } finally {
                window.utils.hideLoading();
            }
        });
    };

    const toggleEmpleadoStatus = async (id) => {
        const empleado = empleados.find(e => e.id === id);
        if (!empleado) return;

        const newStatus = !empleado.activo;
        const action = newStatus ? 'activar' : 'desactivar';

        if (!confirm(`¿Está seguro de ${action} a este empleado?`)) return;

        window.utils.showLoading();
        try {
            const { error } = await supabase
                .from('empleados')
                .update({ activo: newStatus })
                .eq('id', id);

            if (error) throw error;

            window.utils.showToast(`Empleado ${action}do exitosamente`, 'success');
            loadEmpleados();
        } catch (error) {
            console.error('Error actualizando estado:', error);
            window.utils.showToast('Error al actualizar estado', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const loadPagos = async () => {
        window.utils.showLoading();
        try {
            const empleadoId = document.getElementById('filter-empleado-pago').value;
            const mes = document.getElementById('filter-mes-pago').value;

            let query = supabase
                .from('pagos_sueldos')
                .select(`
                    *,
                    empleados (nombre_completo, cargo)
                `)
                .order('fecha_pago', { ascending: false });

            if (empleadoId) {
                query = query.eq('empleado_id', empleadoId);
            }

            if (mes) {
                query = query.eq('periodo', mes);
            }

            const { data, error } = await query;

            if (error) throw error;

            pagos = data || [];
            renderPagos();
        } catch (error) {
            console.error('Error cargando pagos:', error);
            window.utils.showToast('Error al cargar pagos', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const renderPagos = () => {
        const container = document.getElementById('pagos-list');
        
        if (pagos.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay pagos registrados en este período</p>';
            return;
        }

        const total = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);

        container.innerHTML = `
            <div class="list-summary">
                <strong>Total pagado:</strong> ${window.utils.formatCurrency(total)}
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Empleado</th>
                            <th>Cargo</th>
                            <th>Período</th>
                            <th>Monto</th>
                            <th>Método</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagos.map(pago => `
                            <tr>
                                <td>${window.utils.formatDate(pago.fecha_pago)}</td>
                                <td>${pago.empleados.nombre_completo}</td>
                                <td>${pago.empleados.cargo}</td>
                                <td>${pago.periodo}</td>
                                <td class="amount">${window.utils.formatCurrency(pago.monto)}</td>
                                <td>${pago.metodo_pago || '-'}</td>
                                <td class="actions">
                                    <button class="btn-icon" onclick="window.SueldosModule.deletePago('${pago.id}')">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const showAddPagoModal = () => {
        if (empleados.length === 0) {
            window.utils.showToast('Primero debe registrar empleados', 'warning');
            return;
        }

        const today = new Date();
        const currentDate = today.toISOString().slice(0, 10);
        const currentPeriod = today.toISOString().slice(0, 7);

        showModal('Registrar Pago de Sueldo', `
            <form id="pago-form">
                <div class="form-group">
                    <label for="pago-empleado">Empleado *</label>
                    <select id="pago-empleado" required>
                        <option value="">Seleccionar...</option>
                        ${empleados.filter(e => e.activo).map(emp => `
                            <option value="${emp.id}" data-salario="${emp.salario_mensual}">
                                ${emp.nombre_completo} - ${emp.cargo}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="pago-fecha">Fecha de Pago *</label>
                    <input type="date" id="pago-fecha" required value="${currentDate}">
                </div>
                <div class="form-group">
                    <label for="pago-periodo">Período *</label>
                    <input type="month" id="pago-periodo" required value="${currentPeriod}">
                </div>
                <div class="form-group">
                    <label for="pago-monto">Monto *</label>
                    <input type="number" id="pago-monto" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="pago-metodo">Método de Pago</label>
                    <select id="pago-metodo">
                        <option value="transferencia">Transferencia</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="cheque">Cheque</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pago-observaciones">Observaciones</label>
                    <textarea id="pago-observaciones" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Registrar Pago</button>
                </div>
            </form>
        `);

        // Auto-completar salario al seleccionar empleado
        document.getElementById('pago-empleado').addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            const salario = selectedOption.dataset.salario;
            if (salario) {
                document.getElementById('pago-monto').value = salario;
            }
        });

        document.getElementById('pago-form').addEventListener('submit', savePago);
    };

    const savePago = async (e) => {
        e.preventDefault();
        window.utils.showLoading();

        const pagoData = {
            empleado_id: document.getElementById('pago-empleado').value,
            fecha_pago: document.getElementById('pago-fecha').value,
            periodo: document.getElementById('pago-periodo').value,
            monto: parseFloat(document.getElementById('pago-monto').value),
            metodo_pago: document.getElementById('pago-metodo').value,
            observaciones: document.getElementById('pago-observaciones').value
        };

        try {
            const { error } = await supabase
                .from('pagos_sueldos')
                .insert([pagoData]);

            if (error) throw error;

            window.utils.showToast('Pago registrado exitosamente', 'success');
            window.closeModal();
            loadPagos();
        } catch (error) {
            console.error('Error guardando pago:', error);
            window.utils.showToast('Error al registrar pago', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const deletePago = async (id) => {
        if (!confirm('¿Está seguro de eliminar este registro de pago?')) return;

        window.utils.showLoading();
        try {
            const { error } = await supabase
                .from('pagos_sueldos')
                .delete()
                .eq('id', id);

            if (error) throw error;

            window.utils.showToast('Pago eliminado exitosamente', 'success');
            loadPagos();
        } catch (error) {
            console.error('Error eliminando pago:', error);
            window.utils.showToast('Error al eliminar pago', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const updateEmpleadoFilter = () => {
        const select = document.getElementById('filter-empleado-pago');
        select.innerHTML = '<option value="">Todos los empleados</option>' +
            empleados.filter(e => e.activo).map(emp => `
                <option value="${emp.id}">${emp.nombre_completo}</option>
            `).join('');
    };

    const showModal = (title, body) => {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = body;
        document.getElementById('modal').style.display = 'flex';
    };

    return {
        init,
        loadEmpleados,
        loadPagos,
        editEmpleado,
        toggleEmpleadoStatus,
        deletePago
    };
})();

window.SueldosModule = SueldosModule;
