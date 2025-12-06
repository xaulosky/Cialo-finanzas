import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Textarea } from '../../components/UI'
import { departamentoService } from '../../services/supabaseServices'
import './Departamentos.css'

const Departamentos = () => {
    const [loading, setLoading] = useState(true)
    const [departamentos, setDepartamentos] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const { data } = await departamentoService.getDepartamentos()
        setDepartamentos(data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.nombre.trim()) {
            alert('El nombre es requerido')
            return
        }
        setSaving(true)
        const { data, error } = await departamentoService.createDepartamento(formData)
        if (error) {
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            setShowModal(false)
            setFormData({ nombre: '', descripcion: '' })
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        { key: 'nombre', label: 'Nombre' },
        { key: 'descripcion', label: 'Descripción', render: (val) => val || '-' },
        {
            key: 'jefe',
            label: 'Jefe',
            render: (val) => val ? `${val.nombre} ${val.apellido_paterno}` : '-'
        }
    ]

    return (
        <div className="page-departamentos">
            <header className="page-header">
                <div>
                    <h1>Departamentos</h1>
                    <p>Organigrama de la empresa</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    <span className="btn-text-full">Nuevo Departamento</span>
                    <span className="btn-text-short">Nuevo</span>
                </Button>
            </header>

            <div className="total-banner">
                <span className="total-icon">🏢</span>
                <span className="total-text">{departamentos.length} departamentos</span>
            </div>

            <div className="desktop-view">
                <Card padding="none">
                    <Table columns={columns} data={departamentos} loading={loading} emptyMessage="No hay departamentos" emptyIcon="🏢" />
                </Card>
            </div>

            <div className="mobile-view">
                {loading ? (
                    <div className="loading-state"><p>Cargando...</p></div>
                ) : departamentos.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🏢</span>
                        <p>No hay departamentos</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Agregar</Button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {departamentos.map((d) => (
                            <div key={d.id} className="item-card">
                                <div className="item-card-header">
                                    <span className="item-icon">🏢</span>
                                    <div className="item-info">
                                        <span className="item-name">{d.nombre}</span>
                                        {d.descripcion && <span className="item-desc">{d.descripcion}</span>}
                                    </div>
                                </div>
                                {d.jefe && (
                                    <div className="item-footer">
                                        <span>👤 Jefe: {d.jefe.nombre} {d.jefe.apellido_paterno}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Departamento" size="md">
                <form onSubmit={handleSubmit} className="form-simple">
                    <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                    <Textarea label="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={3} />
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Departamentos
