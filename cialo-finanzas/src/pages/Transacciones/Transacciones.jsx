import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select } from '../../components/UI'
import { transaccionService, cuentaService, categoriaService } from '../../services/supabaseServices'
import { formatCurrency, formatDate, getToday } from '../../utils/helpers'
import './Transacciones.css'

const Transacciones = () => {
    const [loading, setLoading] = useState(true)
    const [transacciones, setTransacciones] = useState([])
    const [cuentas, setCuentas] = useState([])
    const [categorias, setCategorias] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        tipo: 'gasto',
        monto: '',
        fecha: getToday(),
        descripcion: '',
        cuenta_id: '',
        categoria_id: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [transRes, cuentasRes, catRes] = await Promise.all([
            transaccionService.getTransacciones(),
            cuentaService.getCuentas(),
            categoriaService.getCategorias()
        ])
        setTransacciones(transRes.data || [])
        setCuentas(cuentasRes.data || [])
        setCategorias(catRes.data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.monto || Number(formData.monto) <= 0) {
            alert('Ingresa un monto válido')
            return
        }
        if (!formData.cuenta_id) {
            alert('Selecciona una cuenta')
            return
        }

        setSaving(true)

        const transaccionData = {
            tipo: formData.tipo,
            monto: Number(formData.monto),
            fecha: formData.fecha,
            descripcion: formData.descripcion || null,
            cuenta_id: formData.cuenta_id,
            categoria_id: formData.categoria_id || null,
            estado: 'confirmada'
        }

        const { data, error } = await transaccionService.createTransaccion(transaccionData)

        if (error) {
            console.error('Error al crear transacción:', error)
            alert('Error al guardar: ' + (error.message || error))
        } else {
            setShowModal(false)
            setFormData({
                tipo: 'gasto',
                monto: '',
                fecha: getToday(),
                descripcion: '',
                cuenta_id: '',
                categoria_id: ''
            })
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        {
            key: 'fecha',
            label: 'Fecha',
            width: '100px',
            render: (val) => formatDate(val)
        },
        {
            key: 'tipo',
            label: 'Tipo',
            width: '80px',
            render: (val) => (
                <span className={`badge badge-${val}`}>
                    {val === 'ingreso' ? '↗️ Ingreso' : '↘️ Gasto'}
                </span>
            )
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            render: (val) => val || '-'
        },
        {
            key: 'categoria',
            label: 'Categoría',
            render: (val) => val?.nombre || '-'
        },
        {
            key: 'cuenta',
            label: 'Cuenta',
            render: (val) => val?.nombre || '-'
        },
        {
            key: 'monto',
            label: 'Monto',
            align: 'right',
            render: (val, row) => (
                <span className={row.tipo === 'ingreso' ? 'text-success' : 'text-error'}>
                    {row.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(val)}
                </span>
            )
        }
    ]

    const categoriasFiltradas = categorias.filter(c => c.tipo === formData.tipo)

    // Calcular resumen
    const resumen = transacciones.reduce(
        (acc, t) => {
            if (t.tipo === 'ingreso') acc.ingresos += Number(t.monto)
            if (t.tipo === 'gasto') acc.gastos += Number(t.monto)
            return acc
        },
        { ingresos: 0, gastos: 0 }
    )
    resumen.balance = resumen.ingresos - resumen.gastos

    return (
        <div className="page-transacciones">
            <header className="page-header">
                <div>
                    <h1>Transacciones</h1>
                    <p>Gestiona tus ingresos y gastos</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    <span className="btn-text-full">Nueva Transacción</span>
                    <span className="btn-text-short">Nueva</span>
                </Button>
            </header>

            {/* Resumen Cards */}
            <div className="resumen-grid">
                <div className="resumen-card ingreso">
                    <span className="resumen-label">Ingresos</span>
                    <span className="resumen-amount">+{formatCurrency(resumen.ingresos)}</span>
                </div>
                <div className="resumen-card gasto">
                    <span className="resumen-label">Gastos</span>
                    <span className="resumen-amount">-{formatCurrency(resumen.gastos)}</span>
                </div>
                <div className={`resumen-card balance ${resumen.balance >= 0 ? 'positivo' : 'negativo'}`}>
                    <span className="resumen-label">Balance</span>
                    <span className="resumen-amount">{formatCurrency(resumen.balance)}</span>
                </div>
            </div>

            {/* Vista Desktop - Tabla */}
            <div className="desktop-view">
                <Card padding="none">
                    <Table
                        columns={columns}
                        data={transacciones}
                        loading={loading}
                        emptyMessage="No hay transacciones registradas"
                        emptyIcon="💸"
                    />
                </Card>
            </div>

            {/* Vista Mobile - Cards */}
            <div className="mobile-view">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <p>Cargando transacciones...</p>
                    </div>
                ) : transacciones.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">💸</span>
                        <p>No hay transacciones registradas</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Nueva transacción</Button>
                    </div>
                ) : (
                    <div className="transacciones-grid">
                        {transacciones.map((t) => (
                            <div key={t.id} className={`transaccion-card ${t.tipo}`}>
                                <div className="transaccion-card-header">
                                    <div className="transaccion-card-tipo">
                                        <span className="tipo-icon">{t.tipo === 'ingreso' ? '↗️' : '↘️'}</span>
                                        <span className={`tipo-label ${t.tipo}`}>
                                            {t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                                        </span>
                                    </div>
                                    <span className="transaccion-card-fecha">{formatDate(t.fecha)}</span>
                                </div>
                                <div className="transaccion-card-body">
                                    <span className="transaccion-card-desc">
                                        {t.descripcion || 'Sin descripción'}
                                    </span>
                                    <div className="transaccion-card-tags">
                                        {t.categoria && (
                                            <span className="tag categoria" style={{ '--tag-color': t.categoria.color }}>
                                                {t.categoria.nombre}
                                            </span>
                                        )}
                                        {t.cuenta && (
                                            <span className="tag cuenta">
                                                🏦 {t.cuenta.nombre}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="transaccion-card-footer">
                                    <span className={`transaccion-card-monto ${t.tipo}`}>
                                        {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(t.monto)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Nueva Transacción */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Nueva Transacción"
                size="md"
            >
                <form onSubmit={handleSubmit} className="form-transaccion">
                    <div className="tipo-toggle">
                        <button
                            type="button"
                            className={`tipo-btn ${formData.tipo === 'gasto' ? 'active gasto' : ''}`}
                            onClick={() => setFormData({ ...formData, tipo: 'gasto', categoria_id: '' })}
                        >
                            📉 Gasto
                        </button>
                        <button
                            type="button"
                            className={`tipo-btn ${formData.tipo === 'ingreso' ? 'active ingreso' : ''}`}
                            onClick={() => setFormData({ ...formData, tipo: 'ingreso', categoria_id: '' })}
                        >
                            📈 Ingreso
                        </button>
                    </div>

                    <div className="form-row">
                        <Input
                            label="Monto"
                            type="number"
                            value={formData.monto}
                            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                            placeholder="0"
                            required
                        />
                        <Input
                            label="Fecha"
                            type="date"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Descripción"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Describe la transacción..."
                    />

                    <div className="form-row">
                        <Select
                            label="Cuenta"
                            value={formData.cuenta_id}
                            onChange={(e) => setFormData({ ...formData, cuenta_id: e.target.value })}
                            options={cuentas.map(c => ({ value: c.id, label: c.nombre }))}
                            required
                        />
                        <Select
                            label="Categoría"
                            value={formData.categoria_id}
                            onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                            options={categoriasFiltradas.map(c => ({ value: c.id, label: c.nombre }))}
                        />
                    </div>

                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={saving}>
                            Guardar Transacción
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Transacciones
