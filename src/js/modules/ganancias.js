// Módulo de Ganancias
const GananciasModule = (() => {
    let ganancias = [];

    const init = () => {
        document.getElementById('add-ganancia-btn').addEventListener('click', showAddGananciaModal);
        document.getElementById('filter-tipo-servicio').addEventListener('change', loadGanancias);
        document.getElementById('filter-mes-ganancia').addEventListener('change', loadGanancias);
        
        // Establecer mes actual por defecto
        const today = new Date();
        const currentMonth = today.toISOString().slice(0, 7);
        document.getElementById('filter-mes-ganancia').value = currentMonth;
    };

    const loadGanancias = async () => {
        window.utils.showLoading();
        try {
            const tipoServicio = document.getElementById('filter-tipo-servicio').value;
            const mes = document.getElementById('filter-mes-ganancia').value;

            let query = supabase
                .from('ganancias')
                .select('*')
                .order('fecha', { ascending: false });

            if (tipoServicio) {
                query = query.eq('tipo_servicio', tipoServicio);
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

            ganancias = data || [];
            renderGanancias();
        } catch (error) {
            console.error('Error cargando ganancias:', error);
            window.utils.showToast('Error al cargar ganancias', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const renderGanancias = () => {
        const container = document.getElementById('ganancias-list');
        
        if (ganancias.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay ganancias registradas en este período</p>';
            return;
        }

        const total = ganancias.reduce((sum, ganancia) => sum + parseFloat(ganancia.monto), 0);
        
        // Agrupar por tipo de servicio
        const porTipo = ganancias.reduce((acc, g) => {
            if (!acc[g.tipo_servicio]) acc[g.tipo_servicio] = 0;
            acc[g.tipo_servicio] += parseFloat(g.monto);
            return acc;
        }, {});

        container.innerHTML = `
            <div class="list-summary">
                <div>
                    <strong>Total de ganancias:</strong> ${window.utils.formatCurrency(total)}
                </div>
                <div class="stats-inline">
                    ${Object.entries(porTipo).map(([tipo, monto]) => `
                        <span class="stat-chip">
                            ${tipo}: ${window.utils.formatCurrency(monto)}
                        </span>
                    `).join('')}
                </div>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo de Servicio</th>
                            <th>Descripción</th>
                            <th>Paciente</th>
                            <th>Método de Pago</th>
                            <th>Monto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ganancias.map(ganancia => `
                            <tr>
                                <td>${window.utils.formatDate(ganancia.fecha)}</td>
                                <td><span class="badge badge-${ganancia.tipo_servicio}">${ganancia.tipo_servicio}</span></td>
                                <td>${ganancia.descripcion || '-'}</td>
                                <td>${ganancia.paciente || '-'}</td>
                                <td>${ganancia.metodo_pago || '-'}</td>
                                <td class="amount positive">${window.utils.formatCurrency(ganancia.monto)}</td>
                                <td class="actions">
                                    <button class="btn-icon" onclick="window.GananciasModule.editGanancia('${ganancia.id}')">✏️</button>
                                    <button class="btn-icon" onclick="window.GananciasModule.deleteGanancia('${ganancia.id}')">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const showAddGananciaModal = () => {
        const today = new Date().toISOString().slice(0, 10);
        showModal('Nueva Ganancia', `
            <form id="ganancia-form">
                <div class="form-group">
                    <label for="ganancia-fecha">Fecha *</label>
                    <input type="date" id="ganancia-fecha" required value="${today}">
                </div>
                <div class="form-group">
                    <label for="ganancia-tipo">Tipo de Servicio *</label>
                    <select id="ganancia-tipo" required>
                        <option value="">Seleccionar...</option>
                        <option value="consulta">Consulta Médica</option>
                        <option value="tratamiento">Tratamiento</option>
                        <option value="cirugia">Cirugía</option>
                        <option value="estetica">Estética</option>
                        <option value="otros">Otros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ganancia-descripcion">Descripción</label>
                    <textarea id="ganancia-descripcion" rows="3" placeholder="Detalle del servicio prestado"></textarea>
                </div>
                <div class="form-group">
                    <label for="ganancia-paciente">Paciente (Opcional)</label>
                    <input type="text" id="ganancia-paciente" placeholder="Nombre del paciente">
                </div>
                <div class="form-group">
                    <label for="ganancia-monto">Monto *</label>
                    <input type="number" id="ganancia-monto" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="ganancia-metodo">Método de Pago</label>
                    <select id="ganancia-metodo">
                        <option value="">Seleccionar...</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="yape">Yape/Plin</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('ganancia-form').addEventListener('submit', saveGanancia);
    };

    const saveGanancia = async (e) => {
        e.preventDefault();
        window.utils.showLoading();

        const gananciaData = {
            fecha: document.getElementById('ganancia-fecha').value,
            tipo_servicio: document.getElementById('ganancia-tipo').value,
            descripcion: document.getElementById('ganancia-descripcion').value,
            paciente: document.getElementById('ganancia-paciente').value,
            monto: parseFloat(document.getElementById('ganancia-monto').value),
            metodo_pago: document.getElementById('ganancia-metodo').value
        };

        try {
            const { error } = await supabase
                .from('ganancias')
                .insert([gananciaData]);

            if (error) throw error;

            window.utils.showToast('Ganancia registrada exitosamente', 'success');
            window.closeModal();
            loadGanancias();
        } catch (error) {
            console.error('Error guardando ganancia:', error);
            window.utils.showToast('Error al guardar ganancia', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const editGanancia = async (id) => {
        const ganancia = ganancias.find(g => g.id === id);
        if (!ganancia) return;

        showModal('Editar Ganancia', `
            <form id="ganancia-edit-form">
                <div class="form-group">
                    <label for="edit-ganancia-fecha">Fecha *</label>
                    <input type="date" id="edit-ganancia-fecha" required value="${ganancia.fecha}">
                </div>
                <div class="form-group">
                    <label for="edit-ganancia-tipo">Tipo de Servicio *</label>
                    <select id="edit-ganancia-tipo" required>
                        <option value="consulta" ${ganancia.tipo_servicio === 'consulta' ? 'selected' : ''}>Consulta Médica</option>
                        <option value="tratamiento" ${ganancia.tipo_servicio === 'tratamiento' ? 'selected' : ''}>Tratamiento</option>
                        <option value="cirugia" ${ganancia.tipo_servicio === 'cirugia' ? 'selected' : ''}>Cirugía</option>
                        <option value="estetica" ${ganancia.tipo_servicio === 'estetica' ? 'selected' : ''}>Estética</option>
                        <option value="otros" ${ganancia.tipo_servicio === 'otros' ? 'selected' : ''}>Otros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-ganancia-descripcion">Descripción</label>
                    <textarea id="edit-ganancia-descripcion" rows="3">${ganancia.descripcion || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="edit-ganancia-paciente">Paciente</label>
                    <input type="text" id="edit-ganancia-paciente" value="${ganancia.paciente || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-ganancia-monto">Monto *</label>
                    <input type="number" id="edit-ganancia-monto" step="0.01" min="0" required value="${ganancia.monto}">
                </div>
                <div class="form-group">
                    <label for="edit-ganancia-metodo">Método de Pago</label>
                    <select id="edit-ganancia-metodo">
                        <option value="">Seleccionar...</option>
                        <option value="efectivo" ${ganancia.metodo_pago === 'efectivo' ? 'selected' : ''}>Efectivo</option>
                        <option value="tarjeta" ${ganancia.metodo_pago === 'tarjeta' ? 'selected' : ''}>Tarjeta</option>
                        <option value="transferencia" ${ganancia.metodo_pago === 'transferencia' ? 'selected' : ''}>Transferencia</option>
                        <option value="yape" ${ganancia.metodo_pago === 'yape' ? 'selected' : ''}>Yape/Plin</option>
                        <option value="otro" ${ganancia.metodo_pago === 'otro' ? 'selected' : ''}>Otro</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Actualizar</button>
                </div>
            </form>
        `);

        document.getElementById('ganancia-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            window.utils.showLoading();

            const updatedData = {
                fecha: document.getElementById('edit-ganancia-fecha').value,
                tipo_servicio: document.getElementById('edit-ganancia-tipo').value,
                descripcion: document.getElementById('edit-ganancia-descripcion').value,
                paciente: document.getElementById('edit-ganancia-paciente').value,
                monto: parseFloat(document.getElementById('edit-ganancia-monto').value),
                metodo_pago: document.getElementById('edit-ganancia-metodo').value
            };

            try {
                const { error } = await supabase
                    .from('ganancias')
                    .update(updatedData)
                    .eq('id', id);

                if (error) throw error;

                window.utils.showToast('Ganancia actualizada exitosamente', 'success');
                window.closeModal();
                loadGanancias();
            } catch (error) {
                console.error('Error actualizando ganancia:', error);
                window.utils.showToast('Error al actualizar ganancia', 'error');
            } finally {
                window.utils.hideLoading();
            }
        });
    };

    const deleteGanancia = async (id) => {
        if (!confirm('¿Está seguro de eliminar esta ganancia?')) return;

        window.utils.showLoading();
        try {
            const { error } = await supabase
                .from('ganancias')
                .delete()
                .eq('id', id);

            if (error) throw error;

            window.utils.showToast('Ganancia eliminada exitosamente', 'success');
            loadGanancias();
        } catch (error) {
            console.error('Error eliminando ganancia:', error);
            window.utils.showToast('Error al eliminar ganancia', 'error');
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
        loadGanancias,
        editGanancia,
        deleteGanancia
    };
})();

window.GananciasModule = GananciasModule;
