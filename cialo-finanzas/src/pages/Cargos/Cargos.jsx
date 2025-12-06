import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select, Textarea } from '../../components/UI'
import { cargoService, departamentoService } from '../../services/supabaseServices'
import { formatCurrency } from '../../utils/helpers'
import '../Departamentos/Departamentos.css'

const Cargos = () => {
    const [loading, setLoading] = useState(true)
    const [cargos, setCargos] = useState([])
    const [departamentos, setDepartamentos] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        salario_base: '',
        departamento_id: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [cargosRes, deptRes] = await Promise.all([
            cargoService.getCargos(),
            departamentoService.getDepartamentos()
        ])
        setCargos(cargosRes.data || [])
        setDepartamentos(deptRes.data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.nombre.trim()) {
            alert('El nombre es requerido')
            return
        }
        setSaving(true)
        const { data, error } = await cargoService.createCargo({
            ...formData,
            salario_base: formData.salario_base ? Number(formData.salario_base) : null,
            departamento_id: formData.departamento_id || null
        })
        if (error) {
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            setShowModal(false)
            setFormData({ nombre: '', descripcion: '', salario_base: '', departamento_id: '' })
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        { key: 'nombre', label: 'Cargo' },
        { key: 'departamento', label: 'Departamento', render: (val) => val?.nombre || '-' },
        { key: 'salario_base', label: 'Salario Base', align: 'right', render: (val) => val ? formatCurrency(val) : '-' },
        { key: 'descripcion', label: 'Descripción', render: (val) => val || '-' }
    ]

    return (
        <div className="page-departamentos">
            <header className="page-header">
                <div>
                    <h1>Cargos</h1>
                    <p>Puestos de trabajo y salarios base</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    <span className="btn-text-full">Nuevo Cargo</span>
                    <span className="btn-text-short">Nuevo</span>
                </Button>
            </header>

            <div className="total-banner">
                <span className="total-icon">💼</span>
                <span className="total-text">{cargos.length} cargos definidos</span>
            </div>

            <div className="desktop-view">
                <Card padding="none">
                    <Table columns={columns} data={cargos} loading={loading} emptyMessage="No hay cargos" emptyIcon="💼" />
                </Card>
            </div>

            <div className="mobile-view">
                {loading ? (
                    <div className="loading-state"><p>Cargando...</p></div>
                ) : cargos.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">💼</span>
                        <p>No hay cargos definidos</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Agregar</Button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {cargos.map((c) => (
                            <div key={c.id} className="item-card">
                                <div className="item-card-header">
                                    <span className="item-icon">💼</span>
                                    <div className="item-info">
                                        <span className="item-name">{c.nombre}</span>
                                        <span className="item-desc">{c.departamento?.nombre || 'Sin departamento'}</span>
                                    </div>
                                </div>
                                <div className="item-footer">
                                    {c.salario_base && <span>💰 {formatCurrency(c.salario_base)}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Cargo" size="md">
                <form onSubmit={handleSubmit} className="form-simple">
                    <Input label="Nombre del Cargo" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                    <Select
                        label="Departamento"
                        value={formData.departamento_id}
                        onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
                        options={departamentos.map(d => ({ value: d.id, label: d.nombre }))}
                    />
                    <Input label="Salario Base" type="number" value={formData.salario_base} onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })} placeholder="0" />
                    <Textarea label="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={2} />
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Cargos
