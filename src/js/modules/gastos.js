// Módulo de Gastos Operacionales
const GastosModule = (() => {
    let gastos = [];
    let filteredGastos = [];

    const init = () => {
        document.getElementById('add-gasto-btn').addEventListener('click', showAddGastoModal);
        document.getElementById('filter-categoria-gasto').addEventListener('change', loadGastos);
        document.getElementById('filter-mes-gasto').addEventListener('change', loadGastos);
        
        // Establecer mes actual por defecto
        const today = new Date();
        const currentMonth = today.toISOString().slice(0, 7);
        document.getElementById('filter-mes-gasto').value = currentMonth;
    };

    const loadGastos = async () => {
        window.utils.showLoading();
        try {
            const categoria = document.getElementById('filter-categoria-gasto').value;
            const mes = document.getElementById('filter-mes-gasto').value;

            let query = supabase
                .from('gastos_operacionales')
                .select('*')
                .order('fecha', { ascending: false });

            if (categoria) {
                query = query.eq('categoria', categoria);
            }

            if (mes) {
                const startDate = `${mes}-01`;
                const endDate = new Date(mes + '-01');
                endDate.setMonth(endDate.getMonth() + 1);
                const endDateStr = endDate.toISOString().slice(0, 10);
                query = query.gte('fecha', startDate).lt('fecha', endDateStr);
            }

            const { data, error } = await query;

            if (error) throw error;

            gastos = data || [];
            renderGastos();
        } catch (error) {
            console.error('Error cargando gastos:', error);
            window.utils.showToast('Error al cargar gastos', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const renderGastos = () => {
        const container = document.getElementById('gastos-list');
        
        if (gastos.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay gastos registrados en este período</p>';
            return;
        }

        const total = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);

        container.innerHTML = `
            <div class="list-summary">
                <strong>Total de gastos:</strong> ${window.utils.formatCurrency(total)}
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                            <th>Monto</th>
                            <th>Comprobante</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gastos.map(gasto => `
                            <tr>
                                <td>${window.utils.formatDate(gasto.fecha)}</td>
                                <td><span class="badge badge-${gasto.categoria}">${gasto.categoria}</span></td>
                                <td>${gasto.descripcion || '-'}</td>
                                <td class="amount">${window.utils.formatCurrency(gasto.monto)}</td>
                                <td>${gasto.comprobante || '-'}</td>
                                <td class="actions">
                                    <button class="btn-icon" onclick="window.GastosModule.editGasto('${gasto.id}')">✏️</button>
                                    <button class="btn-icon" onclick="window.GastosModule.deleteGasto('${gasto.id}')">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const showAddGastoModal = () => {
        const today = new Date().toISOString().slice(0, 10);
        showModal('Nuevo Gasto Operacional', `
            <form id="gasto-form">
                <div class="form-group">
                    <label for="gasto-fecha">Fecha *</label>
                    <input type="date" id="gasto-fecha" required value="${today}">
                </div>
                <div class="form-group">
                    <label for="gasto-categoria">Categoría *</label>
                    <select id="gasto-categoria" required>
                        <option value="">Seleccionar...</option>
                        <option value="luz">Luz</option>
                        <option value="agua">Agua</option>
                        <option value="alquiler">Alquiler</option>
                        <option value="internet">Internet</option>
                        <option value="materiales">Materiales Médicos</option>
                        <option value="limpieza">Limpieza</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="otros">Otros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="gasto-descripcion">Descripción</label>
                    <textarea id="gasto-descripcion" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="gasto-monto">Monto *</label>
                    <input type="number" id="gasto-monto" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="gasto-comprobante">Comprobante</label>
                    <input type="text" id="gasto-comprobante" placeholder="Número o referencia">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('gasto-form').addEventListener('submit', saveGasto);
    };

    const saveGasto = async (e) => {
        e.preventDefault();
        window.utils.showLoading();

        const gastoData = {
            fecha: document.getElementById('gasto-fecha').value,
            categoria: document.getElementById('gasto-categoria').value,
            descripcion: document.getElementById('gasto-descripcion').value,
            monto: parseFloat(document.getElementById('gasto-monto').value),
            comprobante: document.getElementById('gasto-comprobante').value
        };

        try {
            const { error } = await supabase
                .from('gastos_operacionales')
                .insert([gastoData]);

            if (error) throw error;

            window.utils.showToast('Gasto registrado exitosamente', 'success');
            window.closeModal();
            loadGastos();
        } catch (error) {
            console.error('Error guardando gasto:', error);
            window.utils.showToast('Error al guardar gasto', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const editGasto = async (id) => {
        const gasto = gastos.find(g => g.id === id);
        if (!gasto) return;

        showModal('Editar Gasto', `
            <form id="gasto-edit-form">
                <div class="form-group">
                    <label for="edit-gasto-fecha">Fecha *</label>
                    <input type="date" id="edit-gasto-fecha" required value="${gasto.fecha}">
                </div>
                <div class="form-group">
                    <label for="edit-gasto-categoria">Categoría *</label>
                    <select id="edit-gasto-categoria" required>
                        <option value="luz" ${gasto.categoria === 'luz' ? 'selected' : ''}>Luz</option>
                        <option value="agua" ${gasto.categoria === 'agua' ? 'selected' : ''}>Agua</option>
                        <option value="alquiler" ${gasto.categoria === 'alquiler' ? 'selected' : ''}>Alquiler</option>
                        <option value="internet" ${gasto.categoria === 'internet' ? 'selected' : ''}>Internet</option>
                        <option value="materiales" ${gasto.categoria === 'materiales' ? 'selected' : ''}>Materiales Médicos</option>
                        <option value="limpieza" ${gasto.categoria === 'limpieza' ? 'selected' : ''}>Limpieza</option>
                        <option value="mantenimiento" ${gasto.categoria === 'mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                        <option value="otros" ${gasto.categoria === 'otros' ? 'selected' : ''}>Otros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-gasto-descripcion">Descripción</label>
                    <textarea id="edit-gasto-descripcion" rows="3">${gasto.descripcion || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="edit-gasto-monto">Monto *</label>
                    <input type="number" id="edit-gasto-monto" step="0.01" min="0" required value="${gasto.monto}">
                </div>
                <div class="form-group">
                    <label for="edit-gasto-comprobante">Comprobante</label>
                    <input type="text" id="edit-gasto-comprobante" value="${gasto.comprobante || ''}">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Actualizar</button>
                </div>
            </form>
        `);

        document.getElementById('gasto-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            window.utils.showLoading();

            const updatedData = {
                fecha: document.getElementById('edit-gasto-fecha').value,
                categoria: document.getElementById('edit-gasto-categoria').value,
                descripcion: document.getElementById('edit-gasto-descripcion').value,
                monto: parseFloat(document.getElementById('edit-gasto-monto').value),
                comprobante: document.getElementById('edit-gasto-comprobante').value
            };

            try {
                const { error } = await supabase
                    .from('gastos_operacionales')
                    .update(updatedData)
                    .eq('id', id);

                if (error) throw error;

                window.utils.showToast('Gasto actualizado exitosamente', 'success');
                window.closeModal();
                loadGastos();
            } catch (error) {
                console.error('Error actualizando gasto:', error);
                window.utils.showToast('Error al actualizar gasto', 'error');
            } finally {
                window.utils.hideLoading();
            }
        });
    };

    const deleteGasto = async (id) => {
        if (!confirm('¿Está seguro de eliminar este gasto?')) return;

        window.utils.showLoading();
        try {
            const { error } = await supabase
                .from('gastos_operacionales')
                .delete()
                .eq('id', id);

            if (error) throw error;

            window.utils.showToast('Gasto eliminado exitosamente', 'success');
            loadGastos();
        } catch (error) {
            console.error('Error eliminando gasto:', error);
            window.utils.showToast('Error al eliminar gasto', 'error');
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
        loadGastos,
        editGasto,
        deleteGasto
    };
})();

window.GastosModule = GastosModule;
