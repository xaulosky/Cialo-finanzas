import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select, Textarea } from '../../components/UI'
import { centroCostoService, trabajadorService } from '../../services/supabaseServices'
import { formatCurrency } from '../../utils/helpers'
import '../Departamentos/Departamentos.css'

const CentrosCosto = () => {
    const [loading, setLoading] = useState(true)
    const [centros, setCentros] = useState([])
    const [trabajadores, setTrabajadores] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        presupuesto_anual: '',
        responsable_id: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [centrosRes, trabRes] = await Promise.all([
            centroCostoService.getCentrosCosto(),
            trabajadorService.getTrabajadores()
        ])
        setCentros(centrosRes.data || [])
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
        const { data, error } = await centroCostoService.createCentroCosto({
            ...formData,
            presupuesto_anual: formData.presupuesto_anual ? Number(formData.presupuesto_anual) : null,
            responsable_id: formData.responsable_id || null
        })
        if (error) {
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            setShowModal(false)
            setFormData({ codigo: '', nombre: '', descripcion: '', presupuesto_anual: '', responsable_id: '' })
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        { key: 'codigo', label: 'Código', width: '100px' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'responsable', label: 'Responsable', render: (val) => val ? `${val.nombre} ${val.apellido_paterno}` : '-' },
        { key: 'presupuesto_anual', label: 'Presupuesto', align: 'right', render: (val) => val ? formatCurrency(val) : '-' }
    ]

    return (
        <div className="page-departamentos">
            <header className="page-header">
                <div>
                    <h1>Centros de Costo</h1>
                    <p>Agrupación de gastos por área</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    <span className="btn-text-full">Nuevo Centro</span>
                    <span className="btn-text-short">Nuevo</span>
                </Button>
            </header>

            <div className="total-banner">
                <span className="total-icon">📊</span>
                <span className="total-text">{centros.length} centros de costo</span>
            </div>

            <div className="desktop-view">
                <Card padding="none">
                    <Table columns={columns} data={centros} loading={loading} emptyMessage="No hay centros de costo" emptyIcon="📊" />
                </Card>
            </div>

            <div className="mobile-view">
                {loading ? (
                    <div className="loading-state"><p>Cargando...</p></div>
                ) : centros.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📊</span>
                        <p>No hay centros de costo</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Agregar</Button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {centros.map((c) => (
                            <div key={c.id} className="item-card">
                                <div className="item-card-header">
                                    <span className="item-icon">📊</span>
                                    <div className="item-info">
                                        <span className="item-name">{c.nombre}</span>
                                        <span className="item-desc">{c.codigo}</span>
                                    </div>
                                </div>
                                <div className="item-footer">
                                    {c.responsable && <span>👤 {c.responsable.nombre}</span>}
                                    {c.presupuesto_anual && <span style={{ marginLeft: 'auto' }}>{formatCurrency(c.presupuesto_anual)}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Centro de Costo" size="md">
                <form onSubmit={handleSubmit} className="form-simple">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-4)' }}>
                        <Input label="Código" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} required />
                        <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                    </div>
                    <Textarea label="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={2} />
                    <Select
                        label="Responsable"
                        value={formData.responsable_id}
                        onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
                        options={trabajadores.map(t => ({ value: t.id, label: `${t.nombre} ${t.apellido_paterno}` }))}
                    />
                    <Input label="Presupuesto Anual" type="number" value={formData.presupuesto_anual} onChange={(e) => setFormData({ ...formData, presupuesto_anual: e.target.value })} />
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default CentrosCosto
