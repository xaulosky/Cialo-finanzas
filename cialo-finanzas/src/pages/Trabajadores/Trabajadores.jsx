import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select } from '../../components/UI'
import { trabajadorService } from '../../services/supabaseServices'
import { formatRut, formatCurrency, formatDate } from '../../utils/helpers'
import '../Transacciones/Transacciones.css'

const Trabajadores = () => {
    const [loading, setLoading] = useState(true)
    const [trabajadores, setTrabajadores] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        telefono: '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        tipo_contrato: 'indefinido',
        salario_base: '',
        banco: '',
        numero_cuenta: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const { data } = await trabajadorService.getTrabajadores()
        setTrabajadores(data || [])
        setLoading(false)
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
        console.log('Creando trabajador:', formData)

        const { data, error } = await trabajadorService.createTrabajador({
            ...formData,
            salario_base: Number(formData.salario_base),
            estado: 'activo'
        })

        if (error) {
            console.error('Error al crear trabajador:', error)
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            console.log('Trabajador creado:', data)
            setShowModal(false)
            setFormData({
                rut: '', nombre: '', apellido_paterno: '', apellido_materno: '',
                email: '', telefono: '', fecha_ingreso: new Date().toISOString().split('T')[0],
                tipo_contrato: 'indefinido', salario_base: '', banco: '', numero_cuenta: ''
            })
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
        { key: 'fecha_ingreso', label: 'Ingreso', render: (val) => formatDate(val) },
        { key: 'salario_base', label: 'Salario', align: 'right', render: (val) => formatCurrency(val) },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => (
                <span className={`badge ${val === 'activo' ? 'badge-ingreso' : 'badge-gasto'}`}>
                    {val}
                </span>
            )
        }
    ]

    return (
        <div className="page-transacciones">
            <header className="page-header">
                <div>
                    <h1>Trabajadores</h1>
                    <p>Gestiona tu equipo de trabajo</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    Nuevo Trabajador
                </Button>
            </header>

            <Card padding="none">
                <Table columns={columns} data={trabajadores} loading={loading} emptyMessage="No hay trabajadores registrados" emptyIcon="👷" />
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Trabajador" size="lg">
                <form onSubmit={handleSubmit} className="form-transaccion">
                    <div className="form-row">
                        <Input label="RUT" value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} placeholder="12.345.678-9" required />
                        <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                    </div>
                    <div className="form-row">
                        <Input label="Apellido Paterno" value={formData.apellido_paterno} onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })} required />
                        <Input label="Apellido Materno" value={formData.apellido_materno} onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })} />
                    </div>
                    <div className="form-row">
                        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <Input label="Teléfono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                    </div>
                    <div className="form-row">
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
                    <div className="form-row">
                        <Input label="Banco" value={formData.banco} onChange={(e) => setFormData({ ...formData, banco: e.target.value })} />
                        <Input label="Número de Cuenta" value={formData.numero_cuenta} onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar Trabajador</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Trabajadores
