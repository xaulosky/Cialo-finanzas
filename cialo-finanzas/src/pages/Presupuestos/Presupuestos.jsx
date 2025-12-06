import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select } from '../../components/UI'
import { presupuestoService, categoriaService } from '../../services/supabaseServices'
import { formatCurrency, getMonthName } from '../../utils/helpers'
import '../Departamentos/Departamentos.css'

const Presupuestos = () => {
    const [loading, setLoading] = useState(true)
    const [presupuestos, setPresupuestos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [showModal, setShowModal] = useState(false)
    const currentYear = new Date().getFullYear()
    const [formData, setFormData] = useState({
        nombre: '',
        año: currentYear,
        mes: '',
        categoria_id: '',
        monto_presupuestado: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [presRes, catRes] = await Promise.all([
            presupuestoService.getPresupuestos(),
            categoriaService.getCategorias()
        ])
        setPresupuestos(presRes.data || [])
        setCategorias(catRes.data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.nombre.trim() || !formData.monto_presupuestado) {
            alert('Nombre y monto son requeridos')
            return
        }
        setSaving(true)
        const { data, error } = await presupuestoService.createPresupuesto({
            ...formData,
            monto_presupuestado: Number(formData.monto_presupuestado),
            mes: formData.mes ? Number(formData.mes) : null,
            categoria_id: formData.categoria_id || null
        })
        if (error) {
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            setShowModal(false)
            setFormData({ nombre: '', año: currentYear, mes: '', categoria_id: '', monto_presupuestado: '' })
            loadData()
        }
        setSaving(false)
    }

    const totalPresupuestado = presupuestos.reduce((sum, p) => sum + Number(p.monto_presupuestado || 0), 0)
    const totalEjecutado = presupuestos.reduce((sum, p) => sum + Number(p.monto_ejecutado || 0), 0)

    const columns = [
        { key: 'nombre', label: 'Presupuesto' },
        { key: 'año', label: 'Año', width: '80px' },
        { key: 'mes', label: 'Mes', render: (val) => val ? getMonthName(val) : 'Anual' },
        { key: 'categoria', label: 'Categoría', render: (val) => val?.nombre || '-' },
        { key: 'monto_presupuestado', label: 'Presupuestado', align: 'right', render: (val) => formatCurrency(val) },
        { key: 'monto_ejecutado', label: 'Ejecutado', align: 'right', render: (val) => formatCurrency(val || 0) },
        {
            key: 'avance',
            label: '%',
            width: '80px',
            render: (_, row) => {
                const pct = row.monto_presupuestado > 0 ? ((row.monto_ejecutado || 0) / row.monto_presupuestado * 100) : 0
                return <span className={pct > 100 ? 'text-error' : pct > 80 ? 'text-warning' : 'text-success'}>{pct.toFixed(0)}%</span>
            }
        }
    ]

    return (
        <div className="page-departamentos">
            <header className="page-header">
                <div>
                    <h1>Presupuestos</h1>
                    <p>Planificación financiera</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    <span className="btn-text-full">Nuevo Presupuesto</span>
                    <span className="btn-text-short">Nuevo</span>
                </Button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                <div className="total-banner">
                    <span className="total-icon">📋</span>
                    <div>
                        <span className="total-text" style={{ display: 'block' }}>Presupuestado</span>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{formatCurrency(totalPresupuestado)}</span>
                    </div>
                </div>
                <div className="total-banner" style={{ borderColor: totalEjecutado > totalPresupuestado ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)' }}>
                    <span className="total-icon">💰</span>
                    <div>
                        <span className="total-text" style={{ display: 'block' }}>Ejecutado</span>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: totalEjecutado > totalPresupuestado ? 'var(--error-500)' : 'var(--success-500)' }}>{formatCurrency(totalEjecutado)}</span>
                    </div>
                </div>
            </div>

            <div className="desktop-view">
                <Card padding="none">
                    <Table columns={columns} data={presupuestos} loading={loading} emptyMessage="No hay presupuestos" emptyIcon="📋" />
                </Card>
            </div>

            <div className="mobile-view">
                {loading ? (
                    <div className="loading-state"><p>Cargando...</p></div>
                ) : presupuestos.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📋</span>
                        <p>No hay presupuestos</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Agregar</Button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {presupuestos.map((p) => {
                            const pct = p.monto_presupuestado > 0 ? ((p.monto_ejecutado || 0) / p.monto_presupuestado * 100) : 0
                            return (
                                <div key={p.id} className="item-card">
                                    <div className="item-card-header">
                                        <span className="item-icon">📋</span>
                                        <div className="item-info">
                                            <span className="item-name">{p.nombre}</span>
                                            <span className="item-desc">{p.año} - {p.mes ? getMonthName(p.mes) : 'Anual'}</span>
                                        </div>
                                    </div>
                                    <div className="item-footer">
                                        <span>{formatCurrency(p.monto_presupuestado)}</span>
                                        <span style={{ marginLeft: 'auto' }} className={pct > 100 ? 'text-error' : 'text-success'}>{pct.toFixed(0)}%</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Presupuesto" size="md">
                <form onSubmit={handleSubmit} className="form-simple">
                    <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="Año" type="number" value={formData.año} onChange={(e) => setFormData({ ...formData, año: e.target.value })} />
                        <Select
                            label="Mes (opcional)"
                            value={formData.mes}
                            onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                            options={[
                                { value: '', label: 'Anual' },
                                ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }))
                            ]}
                        />
                    </div>
                    <Select
                        label="Categoría (opcional)"
                        value={formData.categoria_id}
                        onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                        options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
                    />
                    <Input label="Monto Presupuestado" type="number" value={formData.monto_presupuestado} onChange={(e) => setFormData({ ...formData, monto_presupuestado: e.target.value })} required />
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Presupuestos
