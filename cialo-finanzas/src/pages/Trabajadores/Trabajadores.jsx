import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select } from '../../components/UI'
import { trabajadorService, departamentoService, cargoService } from '../../services/supabaseServices'
import { formatRut, formatCurrency, formatDate, getToday } from '../../utils/helpers'
import '../Departamentos/Departamentos.css'

const Trabajadores = () => {
    const [loading, setLoading] = useState(true)
    const [trabajadores, setTrabajadores] = useState([])
    const [departamentos, setDepartamentos] = useState([])
    const [cargos, setCargos] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleting, setDeleting] = useState(null)
    const [mostrarInactivos, setMostrarInactivos] = useState(false)
    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        telefono: '',
        fecha_ingreso: getToday(),
        tipo_contrato: 'indefinido',
        salario_base: '',
        banco: '',
        numero_cuenta: '',
        departamento_id: '',
        cargo_id: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async (incluirInactivos = mostrarInactivos) => {
        setLoading(true)
        const [trabRes, deptRes, cargoRes] = await Promise.all([
            trabajadorService.getTrabajadores(incluirInactivos),
            departamentoService.getDepartamentos(),
            cargoService.getCargos()
        ])
        setTrabajadores(trabRes.data || [])
        setDepartamentos(deptRes.data || [])
        setCargos(cargoRes.data || [])
        setLoading(false)
    }

    const toggleInactivos = () => {
        const nuevoValor = !mostrarInactivos
        setMostrarInactivos(nuevoValor)
        loadData(nuevoValor)
    }

    const activos = trabajadores.filter(t => t.estado !== 'desvinculado')
    const inactivos = trabajadores.filter(t => t.estado === 'desvinculado')

    const resetForm = () => {
        setFormData({
            rut: '', nombre: '', apellido_paterno: '', apellido_materno: '',
            email: '', telefono: '', fecha_ingreso: getToday(),
            tipo_contrato: 'indefinido', salario_base: '', banco: '', numero_cuenta: '',
            departamento_id: '', cargo_id: ''
        })
        setEditing(null)
    }

    const handleEdit = (trabajador) => {
        setFormData({
            rut: trabajador.rut || '',
            nombre: trabajador.nombre || '',
            apellido_paterno: trabajador.apellido_paterno || '',
            apellido_materno: trabajador.apellido_materno || '',
            email: trabajador.email || '',
            telefono: trabajador.telefono || '',
            fecha_ingreso: trabajador.fecha_ingreso || getToday(),
            tipo_contrato: trabajador.tipo_contrato || 'indefinido',
            salario_base: trabajador.salario_base || '',
            banco: trabajador.banco || '',
            numero_cuenta: trabajador.numero_cuenta || '',
            departamento_id: trabajador.departamento_id || '',
            cargo_id: trabajador.cargo_id || ''
        })
        setEditing(trabajador)
        setShowModal(true)
    }

    const handleDelete = async () => {
        if (!deleting) return
        const { error } = await trabajadorService.deleteTrabajador(deleting.id)
        if (error) {
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            setDeleting(null)
            loadData()
        }
    }

    const handleReactivar = async (trabajador) => {
        const { error } = await trabajadorService.updateTrabajador(trabajador.id, { estado: 'activo' })
        if (error) {
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            loadData()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.rut.trim() || !formData.nombre.trim() || !formData.apellido_paterno.trim()) {
            alert('RUT, Nombre y Apellido Paterno son requeridos')
            return
        }
        if (!formData.salario_base || Number(formData.salario_base) <= 0) {
            alert('Ingresa un salario válido')
            return
        }

        setSaving(true)
        const payload = {
            ...formData,
            salario_base: Number(formData.salario_base),
            departamento_id: formData.departamento_id || null,
            cargo_id: formData.cargo_id || null,
            estado: 'activo'
        }

        let result
        if (editing) {
            result = await trabajadorService.updateTrabajador(editing.id, payload)
        } else {
            result = await trabajadorService.createTrabajador(payload)
        }

        if (result.error) {
            alert('Error: ' + (result.error.message || JSON.stringify(result.error)))
        } else {
            setShowModal(false)
            resetForm()
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        { key: 'rut', label: 'RUT', width: '120px', render: (val) => formatRut(val) },
        {
            key: 'nombre',
            label: 'Nombre Completo',
            render: (_, row) => `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`
        },
        { key: 'cargo', label: 'Cargo', render: (val) => val?.nombre || '-' },
        { key: 'departamento', label: 'Departamento', render: (val) => val?.nombre || '-' },
        { key: 'salario_base', label: 'Salario', align: 'right', render: (val) => formatCurrency(val) },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => (
                <span className={`badge ${val === 'activo' ? 'badge-ingreso' : 'badge-gasto'}`}>
                    {val || 'activo'}
                </span>
            )
        },
        {
            key: 'actions',
            label: '',
            width: '120px',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {row.estado === 'desvinculado' ? (
                        <button
                            className="btn-icon"
                            onClick={() => handleReactivar(row)}
                            title="Reactivar"
                            style={{ color: 'var(--success-500)' }}
                        >
                            ✅
                        </button>
                    ) : (
                        <>
                            <button className="btn-icon" onClick={() => handleEdit(row)} title="Editar">✏️</button>
                            <button className="btn-icon btn-danger" onClick={() => setDeleting(row)} title="Desvincular">🗑️</button>
                        </>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="page-departamentos">
            <header className="page-header">
                <div>
                    <h1>Trabajadores</h1>
                    <p>Gestiona tu equipo de trabajo</p>
                </div>
                <Button icon="➕" onClick={() => { resetForm(); setShowModal(true) }}>
                    <span className="btn-text-full">Nuevo Trabajador</span>
                    <span className="btn-text-short">Nuevo</span>
                </Button>
            </header>

            <div className="total-banner" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className="total-icon">👷</span>
                    <span className="total-text">
                        {activos.length} activos
                        {mostrarInactivos && inactivos.length > 0 && (
                            <span style={{ color: 'var(--text-tertiary)', marginLeft: '8px' }}>
                                • {inactivos.length} desvinculados
                            </span>
                        )}
                    </span>
                </div>
                <button
                    onClick={toggleInactivos}
                    className="btn-toggle-filter"
                    style={{
                        background: mostrarInactivos ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-2) var(--space-3)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 'var(--text-sm)'
                    }}
                >
                    {mostrarInactivos ? '👁️ Ocultar inactivos' : '👁️ Ver inactivos'}
                </button>
            </div>

            <div className="desktop-view">
                <Card padding="none">
                    <Table columns={columns} data={trabajadores} loading={loading} emptyMessage="No hay trabajadores registrados" emptyIcon="👷" />
                </Card>
            </div>

            <div className="mobile-view">
                {loading ? (
                    <div className="loading-state"><p>Cargando...</p></div>
                ) : trabajadores.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">👷</span>
                        <p>No hay trabajadores</p>
                        <Button variant="outline" onClick={() => { resetForm(); setShowModal(true) }}>+ Agregar</Button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {trabajadores.map((t) => (
                            <div key={t.id} className="item-card" style={{ opacity: t.estado === 'desvinculado' ? 0.7 : 1 }}>
                                <div className="item-card-header">
                                    <span className="item-icon">👤</span>
                                    <div className="item-info">
                                        <span className="item-name">{t.nombre} {t.apellido_paterno}</span>
                                        <span className="item-desc">
                                            {t.cargo?.nombre || 'Sin cargo'}
                                            {t.estado === 'desvinculado' && (
                                                <span className="badge badge-gasto" style={{ marginLeft: '8px', fontSize: '10px' }}>Desvinculado</span>
                                            )}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {t.estado === 'desvinculado' ? (
                                            <button className="btn-icon" onClick={() => handleReactivar(t)} title="Reactivar" style={{ color: 'var(--success-500)' }}>✅</button>
                                        ) : (
                                            <>
                                                <button className="btn-icon" onClick={() => handleEdit(t)}>✏️</button>
                                                <button className="btn-icon btn-danger" onClick={() => setDeleting(t)}>🗑️</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="item-footer">
                                    <span>{formatRut(t.rut)}</span>
                                    <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{formatCurrency(t.salario_base)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title={editing ? 'Editar Trabajador' : 'Nuevo Trabajador'} size="lg">
                <form onSubmit={handleSubmit} className="form-simple">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="RUT" value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} placeholder="12.345.678-9" required />
                        <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="Apellido Paterno" value={formData.apellido_paterno} onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })} required />
                        <Input label="Apellido Materno" value={formData.apellido_materno} onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <Input label="Teléfono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Select
                            label="Departamento"
                            value={formData.departamento_id}
                            onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
                            options={departamentos.map(d => ({ value: d.id, label: d.nombre }))}
                        />
                        <Select
                            label="Cargo"
                            value={formData.cargo_id}
                            onChange={(e) => setFormData({ ...formData, cargo_id: e.target.value })}
                            options={cargos.map(c => ({ value: c.id, label: c.nombre }))}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="Fecha de Ingreso" type="date" value={formData.fecha_ingreso} onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })} required />
                        <Select
                            label="Tipo de Contrato"
                            value={formData.tipo_contrato}
                            onChange={(e) => setFormData({ ...formData, tipo_contrato: e.target.value })}
                            options={[
                                { value: 'indefinido', label: 'Indefinido' },
                                { value: 'plazo_fijo', label: 'Plazo Fijo' },
                                { value: 'honorarios', label: 'Honorarios' },
                                { value: 'practicante', label: 'Práctica' }
                            ]}
                        />
                    </div>
                    <Input label="Salario Base" type="number" value={formData.salario_base} onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })} placeholder="0" required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="Banco" value={formData.banco} onChange={(e) => setFormData({ ...formData, banco: e.target.value })} />
                        <Input label="Número de Cuenta" value={formData.numero_cuenta} onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => { setShowModal(false); resetForm() }}>Cancelar</Button>
                        <Button type="submit" loading={saving}>{editing ? 'Actualizar' : 'Guardar'}</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Confirmar Eliminación */}
            <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Confirmar Eliminación" size="sm">
                <p style={{ marginBottom: 'var(--space-4)' }}>
                    ¿Estás seguro de desvincular a <strong>{deleting?.nombre} {deleting?.apellido_paterno}</strong>?
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                    El trabajador será marcado como desvinculado y no aparecerá en las listas activas.
                </p>
                <div className="form-actions">
                    <Button type="button" variant="ghost" onClick={() => setDeleting(null)}>Cancelar</Button>
                    <Button type="button" variant="danger" onClick={handleDelete}>Desvincular</Button>
                </div>
            </Modal>
        </div>
    )
}

export default Trabajadores
