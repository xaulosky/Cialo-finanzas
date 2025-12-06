import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '../../components/UI'
import { transaccionService, cuentaService } from '../../services/supabaseServices'
import { formatCurrency, getStartOfMonth, getEndOfMonth } from '../../utils/helpers'
import './Dashboard.css'

const Dashboard = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        ingresos: 0,
        gastos: 0,
        balance: 0
    })
    const [cuentas, setCuentas] = useState([])
    const [transacciones, setTransacciones] = useState([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // Resumen del mes
            const { data: resumen } = await transaccionService.getResumen(
                getStartOfMonth(),
                getEndOfMonth()
            )
            if (resumen) setStats(resumen)

            // Cuentas
            const { data: cuentasData } = await cuentaService.getCuentas()
            setCuentas(cuentasData || [])

            // Últimas transacciones
            const { data: transData } = await transaccionService.getTransacciones({ limit: 5 })
            setTransacciones(transData || [])
        } catch (error) {
            console.error('Error loading dashboard:', error)
        }
        setLoading(false)
    }

    const saldoTotal = cuentas.reduce((sum, c) => sum + Number(c.saldo_actual || 0), 0)

    return (
        <div className="dashboard">
            <header className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Resumen financiero del mes actual</p>
                </div>
                <Button onClick={loadData} variant="secondary" icon="🔄">
                    Actualizar
                </Button>
            </header>

            {/* Stats Cards */}
            <section className="stats-grid">
                <div className="stat-card stat-balance">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <span className="stat-label">Saldo Total</span>
                        <span className="stat-value">{formatCurrency(saldoTotal)}</span>
                    </div>
                </div>

                <div className="stat-card stat-income">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <span className="stat-label">Ingresos del Mes</span>
                        <span className="stat-value positive">{formatCurrency(stats.ingresos)}</span>
                    </div>
                </div>

                <div className="stat-card stat-expense">
                    <div className="stat-icon">📉</div>
                    <div className="stat-content">
                        <span className="stat-label">Gastos del Mes</span>
                        <span className="stat-value negative">{formatCurrency(stats.gastos)}</span>
                    </div>
                </div>

                <div className="stat-card stat-net">
                    <div className="stat-icon">💵</div>
                    <div className="stat-content">
                        <span className="stat-label">Balance del Mes</span>
                        <span className={`stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(stats.balance)}
                        </span>
                    </div>
                </div>
            </section>

            {/* Content Grid */}
            <section className="content-grid">
                {/* Cuentas */}
                <Card title="Cuentas" icon="🏦" className="cuentas-card">
                    {loading ? (
                        <div className="loading-placeholder">Cargando...</div>
                    ) : cuentas.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🏦</span>
                            <p>No hay cuentas registradas</p>
                            <Button variant="outline" size="sm" onClick={() => navigate('/cuentas')}>+ Agregar cuenta</Button>
                        </div>
                    ) : (
                        <div className="cuentas-list">
                            {cuentas.map((cuenta) => (
                                <div key={cuenta.id} className="cuenta-item">
                                    <div className="cuenta-info">
                                        <span className="cuenta-tipo">{getTipoCuentaIcon(cuenta.tipo)}</span>
                                        <div>
                                            <span className="cuenta-nombre">{cuenta.nombre}</span>
                                            <span className="cuenta-banco">{cuenta.banco || cuenta.tipo}</span>
                                        </div>
                                    </div>
                                    <span className={`cuenta-saldo ${Number(cuenta.saldo_actual) >= 0 ? 'positive' : 'negative'}`}>
                                        {formatCurrency(cuenta.saldo_actual)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Últimas Transacciones */}
                <Card title="Últimas Transacciones" icon="💸" className="transacciones-card">
                    {loading ? (
                        <div className="loading-placeholder">Cargando...</div>
                    ) : transacciones.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">💸</span>
                            <p>No hay transacciones registradas</p>
                            <Button variant="outline" size="sm" onClick={() => navigate('/transacciones')}>+ Nueva transacción</Button>
                        </div>
                    ) : (
                        <div className="transacciones-list">
                            {transacciones.map((t) => (
                                <div key={t.id} className="transaccion-item">
                                    <div className="transaccion-info">
                                        <span className="transaccion-tipo">
                                            {t.tipo === 'ingreso' ? '↗️' : '↘️'}
                                        </span>
                                        <div>
                                            <span className="transaccion-desc">{t.descripcion || 'Sin descripción'}</span>
                                            <span className="transaccion-cat">{t.categoria?.nombre || 'Sin categoría'}</span>
                                        </div>
                                    </div>
                                    <span className={`transaccion-monto ${t.tipo === 'ingreso' ? 'positive' : 'negative'}`}>
                                        {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(t.monto)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">
                <h3>Acciones Rápidas</h3>
                <div className="actions-grid">
                    <Button variant="secondary" icon="💸" onClick={() => navigate('/transacciones')}>
                        Nueva Transacción
                    </Button>
                    <Button variant="secondary" icon="📥" onClick={() => navigate('/facturas-compra')}>
                        Registrar Factura
                    </Button>
                    <Button variant="secondary" icon="👷" onClick={() => navigate('/trabajadores')}>
                        Agregar Trabajador
                    </Button>
                    <Button variant="secondary" icon="📊" onClick={() => navigate('/reportes')}>
                        Ver Reportes
                    </Button>
                    <Button variant="secondary" icon="🏦" onClick={() => navigate('/cuentas')}>
                        Ver Cuentas
                    </Button>
                    <Button variant="secondary" icon="🏭" onClick={() => navigate('/proveedores')}>
                        Ver Proveedores
                    </Button>
                    <Button variant="secondary" icon="👥" onClick={() => navigate('/clientes')}>
                        Ver Clientes
                    </Button>
                    <Button variant="secondary" icon="📋" onClick={() => navigate('/liquidaciones')}>
                        Liquidaciones
                    </Button>
                </div>
            </section>
        </div>
    )
}

const getTipoCuentaIcon = (tipo) => {
    const icons = {
        banco: '🏦',
        caja: '💵',
        efectivo: '💰',
        tarjeta_credito: '💳',
        inversion: '📈',
        otro: '🏷️'
    }
    return icons[tipo] || '🏦'
}

export default Dashboard

