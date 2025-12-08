import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select } from '../../components/UI'
import { cuentaService } from '../../services/supabaseServices'
import { formatCurrency } from '../../utils/helpers'
import './Cuentas.css'

const Cuentas = () => {
    const [loading, setLoading] = useState(true)
    const [cuentas, setCuentas] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [viewMode, setViewMode] = useState('list')
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'banco',
        banco: '',
        numero_cuenta: '',
        saldo_inicial: 0,
        moneda: 'CLP'
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const { data } = await cuentaService.getCuentas()
        setCuentas(data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        const { error } = await cuentaService.createCuenta({
            ...formData,
            saldo_inicial: Number(formData.saldo_inicial),
            saldo_actual: Number(formData.saldo_inicial)
        })
        if (!error) {
            setShowModal(false)
            setFormData({ nombre: '', tipo: 'banco', banco: '', numero_cuenta: '', saldo_inicial: 0, moneda: 'CLP' })
            loadData()
        }
        setSaving(false)
    }

    const tipoIcons = {
        banco: '🏦',
        caja: '💵',
        efectivo: '💰',
        tarjeta_credito: '💳',
        inversion: '📈',
        otro: '🏷️'
    }

    const tipoLabels = {
        banco: 'Cuenta Bancaria',
        caja: 'Caja',
        efectivo: 'Efectivo',
        tarjeta_credito: 'Tarjeta de Crédito',
        inversion: 'Inversión',
        otro: 'Otro'
    }

    const columns = [
        { key: 'tipo', label: 'Tipo', width: '60px', render: (val) => tipoIcons[val] || '🏷️' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'banco', label: 'Banco', render: (val) => val || '-' },
        { key: 'numero_cuenta', label: 'N° Cuenta', render: (val) => val || '-' },
        { key: 'moneda', label: 'Moneda', width: '80px' },
        {
            key: 'saldo_actual',
            label: 'Saldo Actual',
            align: 'right',
            render: (val) => (
                <span className={Number(val) >= 0 ? 'text-success' : 'text-error'}>
                    {formatCurrency(val)}
                </span>
            )
        }
    ]

    const saldoTotal = cuentas.reduce((sum, c) => sum + Number(c.saldo_actual || 0), 0)

    return (
        <div className={`page-cuentas view-mode-${viewMode}`}>
            <header className="page-header">
                <div>
                    <h1>Cuentas</h1>
                    <p>Administra tus cuentas bancarias y cajas</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <div className="view-toggle">
                        <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="Vista lista">📝</button>
                        <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Vista grid">📱</button>
                    </div>
                    <Button icon="➕" onClick={() => setShowModal(true)}>
                        <span className="btn-text-full">Nueva Cuenta</span>
                        <span className="btn-text-short">Nueva</span>
                    </Button>
                </div>
            </header>

            {/* Resumen Total */}
            <div className="total-card">
                <div className="total-label">Saldo Total</div>
                <div className={`total-amount ${saldoTotal >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(saldoTotal)}
                </div>
            </div>

            {/* Vista Lista - Tabla */}
            <div className="list-view">
                <Card padding="none">
                    <Table columns={columns} data={cuentas} loading={loading} emptyMessage="No hay cuentas registradas" emptyIcon="🏦" />
                </Card>
            </div>

            {/* Vista Grid - Cards */}
            <div className="grid-view">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <p>Cargando cuentas...</p>
                    </div>
                ) : cuentas.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🏦</span>
                        <p>No hay cuentas registradas</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Agregar cuenta</Button>
                    </div>
                ) : (
                    <div className="cuentas-grid">
                        {cuentas.map((cuenta) => (
                            <div key={cuenta.id} className="cuenta-card">
                                <div className="cuenta-card-header">
                                    <span className="cuenta-card-icon">{tipoIcons[cuenta.tipo] || '🏷️'}</span>
                                    <div className="cuenta-card-info">
                                        <span className="cuenta-card-name">{cuenta.nombre}</span>
                                        <span className="cuenta-card-type">{tipoLabels[cuenta.tipo] || 'Otro'}</span>
                                    </div>
                                </div>
                                <div className="cuenta-card-details">
                                    {cuenta.banco && (
                                        <div className="cuenta-detail-row">
                                            <span className="detail-label">Banco:</span>
                                            <span className="detail-value">{cuenta.banco}</span>
                                        </div>
                                    )}
                                    {cuenta.numero_cuenta && (
                                        <div className="cuenta-detail-row">
                                            <span className="detail-label">N° Cuenta:</span>
                                            <span className="detail-value">{cuenta.numero_cuenta}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="cuenta-card-footer">
                                    <span className="cuenta-card-currency">{cuenta.moneda}</span>
                                    <span className={`cuenta-card-balance ${Number(cuenta.saldo_actual) >= 0 ? 'positive' : 'negative'}`}>
                                        {formatCurrency(cuenta.saldo_actual)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Cuenta" size="md">
                <form onSubmit={handleSubmit} className="form-cuenta">
                    <Input
                        label="Nombre de la Cuenta"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Cuenta Corriente"
                        required
                    />
                    <Select
                        label="Tipo de Cuenta"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        options={[
                            { value: 'banco', label: '🏦 Cuenta Bancaria' },
                            { value: 'caja', label: '💵 Caja' },
                            { value: 'efectivo', label: '💰 Efectivo' },
                            { value: 'tarjeta_credito', label: '💳 Tarjeta de Crédito' },
                            { value: 'inversion', label: '📈 Inversión' },
                            { value: 'otro', label: '🏷️ Otro' }
                        ]}
                    />
                    <div className="form-row">
                        <Input
                            label="Banco"
                            value={formData.banco}
                            onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                            placeholder="Nombre del banco"
                        />
                        <Input
                            label="Número de Cuenta"
                            value={formData.numero_cuenta}
                            onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                        />
                    </div>
                    <div className="form-row">
                        <Input
                            label="Saldo Inicial"
                            type="number"
                            value={formData.saldo_inicial}
                            onChange={(e) => setFormData({ ...formData, saldo_inicial: e.target.value })}
                            placeholder="0"
                        />
                        <Select
                            label="Moneda"
                            value={formData.moneda}
                            onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                            options={[
                                { value: 'CLP', label: 'CLP - Peso Chileno' },
                                { value: 'USD', label: 'USD - Dólar' },
                                { value: 'EUR', label: 'EUR - Euro' }
                            ]}
                        />
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar Cuenta</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Cuentas
