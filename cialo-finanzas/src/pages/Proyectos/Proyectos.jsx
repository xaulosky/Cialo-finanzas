import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select, Textarea } from '../../components/UI'
import { proyectoService, clienteService, trabajadorService, centroCostoService } from '../../services/supabaseServices'
import { formatCurrency, formatDate, getToday } from '../../utils/helpers'
import '../Departamentos/Departamentos.css'

const Proyectos = () => {
    const [loading, setLoading] = useState(true)
    const [proyectos, setProyectos] = useState([])
    const [clientes, setClientes] = useState([])
    const [trabajadores, setTrabajadores] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        cliente_id: '',
        responsable_id: '',
        fecha_inicio: getToday(),
        fecha_fin_estimada: '',
        presupuesto: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [proyRes, cliRes, trabRes] = await Promise.all([
            proyectoService.getProyectos(),
            clienteService.getClientes(),
            trabajadorService.getTrabajadores()
        ])
        setProyectos(proyRes.data || [])
        setClientes(cliRes.data || [])
        setTrabajadores(trabRes.data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.codigo.trim() || !formData.nombre.trim()) {
            alert('Código y nombre son requeridos')
            return
        }
        setSaving(true)
        const { data, error } = await proyectoService.createProyecto({
            ...formData,
            presupuesto: formData.presupuesto ? Number(formData.presupuesto) : null,
            cliente_id: formData.cliente_id || null,
            responsable_id: formData.responsable_id || null,
            estado: 'activo'
        })
        if (error) {
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            setShowModal(false)
            setFormData({ codigo: '', nombre: '', descripcion: '', cliente_id: '', responsable_id: '', fecha_inicio: getToday(), fecha_fin_estimada: '', presupuesto: '' })
            loadData()
        }
        setSaving(false)
    }

    const estadoColors = {
        planificacion: 'badge-muted',
        activo: 'badge-ingreso',
        pausado: 'badge-gasto',
        completado: 'badge-info',
        cancelado: 'badge-error'
    }

    const columns = [
        { key: 'codigo', label: 'Código', width: '100px' },
        { key: 'nombre', label: 'Proyecto' },
        { key: 'cliente', label: 'Cliente', render: (val) => val?.nombre || '-' },
        { key: 'fecha_inicio', label: 'Inicio', render: (val) => formatDate(val) },
        { key: 'presupuesto', label: 'Presupuesto', align: 'right', render: (val) => val ? formatCurrency(val) : '-' },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => <span className={`badge ${estadoColors[val] || ''}`}>{val}</span>
        }
    ]

    return (
        <div className="page-departamentos">
            <header className="page-header">
                <div>
                    <h1>Proyectos</h1>
                    <p>Gestión de proyectos y presupuestos</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    <span className="btn-text-full">Nuevo Proyecto</span>
                    <span className="btn-text-short">Nuevo</span>
                </Button>
            </header>

            <div className="total-banner">
                <span className="total-icon">📁</span>
                <span className="total-text">{proyectos.filter(p => p.estado === 'activo').length} proyectos activos</span>
            </div>

            <div className="desktop-view">
                <Card padding="none">
                    <Table columns={columns} data={proyectos} loading={loading} emptyMessage="No hay proyectos" emptyIcon="📁" />
                </Card>
            </div>

            <div className="mobile-view">
                {loading ? (
                    <div className="loading-state"><p>Cargando...</p></div>
                ) : proyectos.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📁</span>
                        <p>No hay proyectos</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Agregar</Button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {proyectos.map((p) => (
                            <div key={p.id} className="item-card">
                                <div className="item-card-header">
                                    <span className="item-icon">📁</span>
                                    <div className="item-info">
                                        <span className="item-name">{p.nombre}</span>
                                        <span className="item-desc">{p.codigo} | {p.cliente?.nombre || 'Sin cliente'}</span>
                                    </div>
                                </div>
                                <div className="item-footer">
                                    <span className={`badge ${estadoColors[p.estado] || ''}`}>{p.estado}</span>
                                    {p.presupuesto && <span style={{ marginLeft: 'auto' }}>{formatCurrency(p.presupuesto)}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Proyecto" size="lg">
                <form onSubmit={handleSubmit} className="form-simple">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-4)' }}>
                        <Input label="Código" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} required />
                        <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                    </div>
                    <Textarea label="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={2} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Select
                            label="Cliente"
                            value={formData.cliente_id}
                            onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                            options={clientes.map(c => ({ value: c.id, label: c.nombre }))}
                        />
                        <Select
                            label="Responsable"
                            value={formData.responsable_id}
                            onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
                            options={trabajadores.map(t => ({ value: t.id, label: `${t.nombre} ${t.apellido_paterno}` }))}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="Fecha Inicio" type="date" value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} />
                        <Input label="Fecha Fin Estimada" type="date" value={formData.fecha_fin_estimada} onChange={(e) => setFormData({ ...formData, fecha_fin_estimada: e.target.value })} />
                        <Input label="Presupuesto" type="number" value={formData.presupuesto} onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Proyectos
