import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Textarea } from '../../components/UI'
import { proveedorService } from '../../services/supabaseServices'
import { formatRut } from '../../utils/helpers'
import './Proveedores.css'

const Proveedores = () => {
    const [loading, setLoading] = useState(true)
    const [proveedores, setProveedores] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [viewMode, setViewMode] = useState('list')
    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        razon_social: '',
        giro: '',
        direccion: '',
        telefono: '',
        email: '',
        contacto_nombre: '',
        notas: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const { data } = await proveedorService.getProveedores()
        setProveedores(data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.nombre.trim()) {
            alert('El nombre es requerido')
            return
        }

        setSaving(true)
        const { data, error } = await proveedorService.createProveedor(formData)

        if (error) {
            console.error('Error al crear proveedor:', error)
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            setShowModal(false)
            setFormData({
                rut: '', nombre: '', razon_social: '', giro: '',
                direccion: '', telefono: '', email: '', contacto_nombre: '', notas: ''
            })
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        { key: 'rut', label: 'RUT', width: '120px', render: (val) => formatRut(val) || '-' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'giro', label: 'Giro', render: (val) => val || '-' },
        { key: 'telefono', label: 'Teléfono', render: (val) => val || '-' },
        { key: 'email', label: 'Email', render: (val) => val || '-' },
        { key: 'contacto_nombre', label: 'Contacto', render: (val) => val || '-' }
    ]

    return (
        <div className={`page-proveedores view-mode-${viewMode}`}>
            <header className="page-header">
                <div>
                    <h1>Proveedores</h1>
                    <p>Gestiona tus proveedores y acreedores</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <div className="view-toggle">
                        <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="Vista lista">📝</button>
                        <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Vista grid">📱</button>
                    </div>
                    <Button icon="➕" onClick={() => setShowModal(true)}>
                        <span className="btn-text-full">Nuevo Proveedor</span>
                        <span className="btn-text-short">Nuevo</span>
                    </Button>
                </div>
            </header>

            {/* Total */}
            <div className="total-banner">
                <span className="total-icon">🏭</span>
                <span className="total-text">{proveedores.length} proveedores registrados</span>
            </div>

            {/* Vista Lista - Tabla */}
            <div className="list-view">
                <Card padding="none">
                    <Table
                        columns={columns}
                        data={proveedores}
                        loading={loading}
                        emptyMessage="No hay proveedores registrados"
                        emptyIcon="🏭"
                    />
                </Card>
            </div>

            {/* Vista Grid - Cards */}
            <div className="grid-view">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <p>Cargando proveedores...</p>
                    </div>
                ) : proveedores.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🏭</span>
                        <p>No hay proveedores registrados</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Agregar proveedor</Button>
                    </div>
                ) : (
                    <div className="proveedores-grid">
                        {proveedores.map((p) => (
                            <div key={p.id} className="proveedor-card">
                                <div className="proveedor-card-header">
                                    <div className="proveedor-avatar">
                                        {p.nombre?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="proveedor-info">
                                        <span className="proveedor-nombre">{p.nombre}</span>
                                        <span className="proveedor-rut">{formatRut(p.rut) || 'Sin RUT'}</span>
                                    </div>
                                </div>
                                {(p.giro || p.direccion) && (
                                    <div className="proveedor-card-body">
                                        {p.giro && <span className="proveedor-giro">{p.giro}</span>}
                                        {p.direccion && <span className="proveedor-direccion">📍 {p.direccion}</span>}
                                    </div>
                                )}
                                <div className="proveedor-card-footer">
                                    {p.telefono && (
                                        <a href={`tel:${p.telefono}`} className="proveedor-action">
                                            📞 {p.telefono}
                                        </a>
                                    )}
                                    {p.email && (
                                        <a href={`mailto:${p.email}`} className="proveedor-action">
                                            ✉️ {p.email}
                                        </a>
                                    )}
                                    {p.contacto_nombre && (
                                        <span className="proveedor-contacto">👤 {p.contacto_nombre}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Proveedor" size="lg">
                <form onSubmit={handleSubmit} className="form-proveedor">
                    <div className="form-row">
                        <Input label="RUT" value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} placeholder="12.345.678-9" />
                        <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <Input label="Razón Social" value={formData.razon_social} onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })} />
                        <Input label="Giro" value={formData.giro} onChange={(e) => setFormData({ ...formData, giro: e.target.value })} />
                    </div>
                    <Input label="Dirección" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
                    <div className="form-row">
                        <Input label="Teléfono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <Input label="Nombre de Contacto" value={formData.contacto_nombre} onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })} />
                    <Textarea label="Notas" value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} rows={3} />
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar Proveedor</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Proveedores
