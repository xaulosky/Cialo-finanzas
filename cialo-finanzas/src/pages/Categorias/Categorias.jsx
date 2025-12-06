import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select } from '../../components/UI'
import { categoriaService } from '../../services/supabaseServices'
import '../Transacciones/Transacciones.css'

const Categorias = () => {
    const [loading, setLoading] = useState(true)
    const [categorias, setCategorias] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'gasto',
        descripcion: '',
        color: '#6366f1'
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const { data } = await categoriaService.getCategorias()
        setCategorias(data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.nombre.trim()) {
            alert('El nombre es requerido')
            return
        }

        setSaving(true)
        console.log('Creando categoría:', formData)

        const { data, error } = await categoriaService.createCategoria(formData)

        if (error) {
            console.error('Error al crear categoría:', error)
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            console.log('Categoría creada:', data)
            setShowModal(false)
            setFormData({ nombre: '', tipo: 'gasto', descripcion: '', color: '#6366f1' })
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        {
            key: 'color',
            label: '',
            width: '40px',
            render: (val) => <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: val || '#6366f1' }} />
        },
        { key: 'nombre', label: 'Nombre' },
        {
            key: 'tipo',
            label: 'Tipo',
            render: (val) => (
                <span className={`badge badge-${val}`}>
                    {val === 'ingreso' ? '📈 Ingreso' : val === 'gasto' ? '📉 Gasto' : '↔️ Transferencia'}
                </span>
            )
        },
        { key: 'descripcion', label: 'Descripción', render: (val) => val || '-' }
    ]

    return (
        <div className="page-transacciones">
            <header className="page-header">
                <div>
                    <h1>Categorías</h1>
                    <p>Organiza tus transacciones por categoría</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    Nueva Categoría
                </Button>
            </header>

            <Card padding="none">
                <Table columns={columns} data={categorias} loading={loading} emptyMessage="No hay categorías registradas" emptyIcon="🏷️" />
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Categoría" size="md">
                <form onSubmit={handleSubmit} className="form-transaccion">
                    <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Servicios básicos" required />
                    <Select
                        label="Tipo"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        options={[
                            { value: 'gasto', label: '📉 Gasto' },
                            { value: 'ingreso', label: '📈 Ingreso' },
                            { value: 'transferencia', label: '↔️ Transferencia' }
                        ]}
                    />
                    <div className="form-row">
                        <Input label="Color" type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                        <Input label="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar Categoría</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Categorias
