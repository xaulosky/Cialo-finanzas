import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select } from '../../components/UI'
import { facturaCompraService, proveedorService } from '../../services/supabaseServices'
import { formatCurrency, formatDate, getToday } from '../../utils/helpers'
import '../Transacciones/Transacciones.css'

const FacturasCompra = () => {
    const [loading, setLoading] = useState(true)
    const [facturas, setFacturas] = useState([])
    const [proveedores, setProveedores] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        proveedor_id: '',
        numero_factura: '',
        tipo_documento: 'factura',
        fecha_emision: getToday(),
        fecha_vencimiento: '',
        subtotal: 0,
        iva: 0,
        total: 0
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [factRes, provRes] = await Promise.all([
            facturaCompraService.getFacturas(),
            proveedorService.getProveedores()
        ])
        setFacturas(factRes.data || [])
        setProveedores(provRes.data || [])
        setLoading(false)
    }

    const calcularTotal = (subtotal) => {
        const sub = Number(subtotal) || 0
        const iva = sub * 0.19
        return { subtotal: sub, iva, total: sub + iva }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.proveedor_id) {
            alert('Selecciona un proveedor')
            return
        }
        if (!formData.numero_factura.trim()) {
            alert('Ingresa el número de factura')
            return
        }
        if (!formData.subtotal || Number(formData.subtotal) <= 0) {
            alert('Ingresa un monto válido')
            return
        }

        setSaving(true)
        const totales = calcularTotal(formData.subtotal)
        console.log('Creando factura:', { ...formData, ...totales })

        const { data, error } = await facturaCompraService.createFactura({
            ...formData,
            ...totales,
            estado: 'pendiente'
        })

        if (error) {
            console.error('Error al crear factura:', error)
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            console.log('Factura creada:', data)
            setShowModal(false)
            setFormData({
                proveedor_id: '', numero_factura: '', tipo_documento: 'factura',
                fecha_emision: getToday(), fecha_vencimiento: '', subtotal: 0, iva: 0, total: 0
            })
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        { key: 'numero_factura', label: 'N° Factura' },
        { key: 'proveedor', label: 'Proveedor', render: (val) => val?.nombre || '-' },
        { key: 'fecha_emision', label: 'Emisión', render: (val) => formatDate(val) },
        { key: 'fecha_vencimiento', label: 'Vencimiento', render: (val) => formatDate(val) },
        { key: 'total', label: 'Total', align: 'right', render: (val) => formatCurrency(val) },
        { key: 'saldo_pendiente', label: 'Pendiente', align: 'right', render: (val) => <span className="text-error">{formatCurrency(val)}</span> },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => (
                <span className={`badge ${val === 'pagada' ? 'badge-ingreso' : 'badge-gasto'}`}>
                    {val}
                </span>
            )
        }
    ]

    const totalesCalc = calcularTotal(formData.subtotal)

    return (
        <div className="page-transacciones">
            <header className="page-header">
                <div>
                    <h1>Facturas de Compra</h1>
                    <p>Registra las facturas de tus proveedores</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    Nueva Factura
                </Button>
            </header>

            <Card padding="none">
                <Table columns={columns} data={facturas} loading={loading} emptyMessage="No hay facturas registradas" emptyIcon="📥" />
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Factura de Compra" size="md">
                <form onSubmit={handleSubmit} className="form-transaccion">
                    <Select
                        label="Proveedor"
                        value={formData.proveedor_id}
                        onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                        options={proveedores.map(p => ({ value: p.id, label: p.nombre }))}
                        required
                    />
                    <div className="form-row">
                        <Input label="N° Factura" value={formData.numero_factura} onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })} required />
                        <Select
                            label="Tipo Documento"
                            value={formData.tipo_documento}
                            onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                            options={[
                                { value: 'factura', label: 'Factura' },
                                { value: 'factura_exenta', label: 'Factura Exenta' },
                                { value: 'boleta', label: 'Boleta' },
                                { value: 'nota_credito', label: 'Nota de Crédito' }
                            ]}
                        />
                    </div>
                    <div className="form-row">
                        <Input label="Fecha Emisión" type="date" value={formData.fecha_emision} onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })} required />
                        <Input label="Fecha Vencimiento" type="date" value={formData.fecha_vencimiento} onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })} />
                    </div>
                    <Input label="Neto" type="number" value={formData.subtotal} onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })} required />
                    <div style={{ background: 'var(--bg-card)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                            <span>IVA (19%):</span><span>{formatCurrency(totalesCalc.iva)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                            <span>Total:</span><span>{formatCurrency(totalesCalc.total)}</span>
                        </div>
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar Factura</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default FacturasCompra
