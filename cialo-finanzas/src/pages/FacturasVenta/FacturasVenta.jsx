import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select } from '../../components/UI'
import { facturaVentaService, clienteService } from '../../services/supabaseServices'
import { formatCurrency, formatDate, getToday } from '../../utils/helpers'
import '../Transacciones/Transacciones.css'

const FacturasVenta = () => {
    const [loading, setLoading] = useState(true)
    const [facturas, setFacturas] = useState([])
    const [clientes, setClientes] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        cliente_id: '',
        numero_factura: '',
        tipo_documento: 'factura',
        fecha_emision: getToday(),
        fecha_vencimiento: '',
        subtotal: 0
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [factRes, cliRes] = await Promise.all([
            facturaVentaService.getFacturas(),
            clienteService.getClientes()
        ])
        setFacturas(factRes.data || [])
        setClientes(cliRes.data || [])
        setLoading(false)
    }

    const calcularTotal = (subtotal) => {
        const sub = Number(subtotal) || 0
        const iva = sub * 0.19
        return { subtotal: sub, iva, total: sub + iva }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        const totales = calcularTotal(formData.subtotal)
        const { error } = await facturaVentaService.createFactura({
            ...formData,
            ...totales
        })
        if (!error) {
            setShowModal(false)
            setFormData({
                cliente_id: '', numero_factura: '', tipo_documento: 'factura',
                fecha_emision: getToday(), fecha_vencimiento: '', subtotal: 0
            })
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        { key: 'numero_factura', label: 'N° Factura' },
        { key: 'cliente', label: 'Cliente', render: (val) => val?.nombre || '-' },
        { key: 'fecha_emision', label: 'Emisión', render: (val) => formatDate(val) },
        { key: 'total', label: 'Total', align: 'right', render: (val) => formatCurrency(val) },
        { key: 'saldo_pendiente', label: 'Por Cobrar', align: 'right', render: (val) => <span className="text-error">{formatCurrency(val)}</span> },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => (
                <span className={`badge ${val === 'cobrada' ? 'badge-ingreso' : 'badge-gasto'}`}>
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
                    <h1>Facturas de Venta</h1>
                    <p>Emite facturas a tus clientes</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    Nueva Factura
                </Button>
            </header>

            <Card padding="none">
                <Table columns={columns} data={facturas} loading={loading} emptyMessage="No hay facturas registradas" emptyIcon="📤" />
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Factura de Venta" size="md">
                <form onSubmit={handleSubmit} className="form-transaccion">
                    <Select
                        label="Cliente"
                        value={formData.cliente_id}
                        onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                        options={clientes.map(c => ({ value: c.id, label: c.nombre }))}
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
                                { value: 'boleta', label: 'Boleta' }
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
                        <Button type="submit" loading={saving}>Emitir Factura</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default FacturasVenta
