import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select, Textarea } from '../../components/UI'
import { clienteService } from '../../services/supabaseServices'
import { formatRut, formatCurrency } from '../../utils/helpers'
import '../Transacciones/Transacciones.css'

const Clientes = () => {
    const [loading, setLoading] = useState(true)
    const [clientes, setClientes] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        tipo: 'empresa',
        rut: '',
        nombre: '',
        razon_social: '',
        direccion: '',
        telefono: '',
        email: '',
        limite_credito: 0,
        notas: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const { data } = await clienteService.getClientes()
        setClientes(data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.nombre.trim()) {
            alert('El nombre es requerido')
            return
        }

        setSaving(true)
        console.log('Creando cliente:', formData)

        const { data, error } = await clienteService.createCliente({
            ...formData,
            limite_credito: Number(formData.limite_credito) || 0
        })

        if (error) {
            console.error('Error al crear cliente:', error)
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            console.log('Cliente creado:', data)
            setShowModal(false)
            setFormData({
                tipo: 'empresa', rut: '', nombre: '', razon_social: '',
                direccion: '', telefono: '', email: '', limite_credito: 0, notas: ''
            })
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        { key: 'tipo', label: 'Tipo', width: '80px', render: (val) => val === 'persona' ? '👤' : '🏢' },
        { key: 'rut', label: 'RUT', width: '120px', render: (val) => formatRut(val) || '-' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'telefono', label: 'Teléfono', render: (val) => val || '-' },
        { key: 'email', label: 'Email', render: (val) => val || '-' },
        { key: 'limite_credito', label: 'Límite Crédito', align: 'right', render: (val) => formatCurrency(val) }
    ]

    return (
        <div className="page-transacciones">
            <header className="page-header">
                <div>
                    <h1>Clientes</h1>
                    <p>Gestiona tu cartera de clientes</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    Nuevo Cliente
                </Button>
            </header>

            <Card padding="none">
                <Table columns={columns} data={clientes} loading={loading} emptyMessage="No hay clientes registrados" emptyIcon="👥" />
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Cliente" size="lg">
                <form onSubmit={handleSubmit} className="form-transaccion">
                    <Select
                        label="Tipo de Cliente"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        options={[{ value: 'empresa', label: '🏢 Empresa' }, { value: 'persona', label: '👤 Persona' }]}
                    />
                    <div className="form-row">
                        <Input label="RUT" value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} />
                        <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                    </div>
                    <Input label="Razón Social" value={formData.razon_social} onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })} />
                    <Input label="Dirección" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
                    <div className="form-row">
                        <Input label="Teléfono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <Input label="Límite de Crédito" type="number" value={formData.limite_credito} onChange={(e) => setFormData({ ...formData, limite_credito: e.target.value })} />
                    <Textarea label="Notas" value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} rows={3} />
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar Cliente</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Clientes
