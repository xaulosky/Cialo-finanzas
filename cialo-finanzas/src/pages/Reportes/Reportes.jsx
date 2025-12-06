import { useState, useEffect } from 'react'
import { Card, Button } from '../../components/UI'
import { transaccionService, cuentaService } from '../../services/supabaseServices'
import { formatCurrency, getStartOfMonth, getEndOfMonth, getMonthName } from '../../utils/helpers'
import '../Dashboard/Dashboard.css'

const Reportes = () => {
    const [loading, setLoading] = useState(true)
    const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0 })
    const [transacciones, setTransacciones] = useState([])
    const [cuentas, setCuentas] = useState([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [resumenRes, transRes, cuentasRes] = await Promise.all([
            transaccionService.getResumen(getStartOfMonth(), getEndOfMonth()),
            transaccionService.getTransacciones({ limit: 100 }),
            cuentaService.getCuentas()
        ])
        setResumen(resumenRes.data || { ingresos: 0, gastos: 0, balance: 0 })
        setTransacciones(transRes.data || [])
        setCuentas(cuentasRes.data || [])
        setLoading(false)
    }

    // Agrupar por categoría
    const gastosPorCategoria = transacciones
        .filter(t => t.tipo === 'gasto')
        .reduce((acc, t) => {
            const cat = t.categoria?.nombre || 'Sin categoría'
            acc[cat] = (acc[cat] || 0) + Number(t.monto)
            return acc
        }, {})

    const ingresosPorCategoria = transacciones
        .filter(t => t.tipo === 'ingreso')
        .reduce((acc, t) => {
            const cat = t.categoria?.nombre || 'Sin categoría'
            acc[cat] = (acc[cat] || 0) + Number(t.monto)
            return acc
        }, {})

    const saldoTotal = cuentas.reduce((sum, c) => sum + Number(c.saldo_actual || 0), 0)
    const mesActual = getMonthName(new Date().getMonth() + 1)

    return (
        <div className="dashboard">
            <header className="page-header">
                <div>
                    <h1>Reportes Financieros</h1>
                    <p>Análisis de {mesActual} {new Date().getFullYear()}</p>
                </div>
                <Button onClick={loadData} variant="secondary" icon="🔄">
                    Actualizar
                </Button>
            </header>

            {/* Resumen Principal */}
            <section className="stats-grid">
                <div className="stat-card stat-balance">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <span className="stat-label">Patrimonio Total</span>
                        <span className="stat-value">{formatCurrency(saldoTotal)}</span>
                    </div>
                </div>
                <div className="stat-card stat-income">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <span className="stat-label">Ingresos {mesActual}</span>
                        <span className="stat-value positive">{formatCurrency(resumen.ingresos)}</span>
                    </div>
                </div>
                <div className="stat-card stat-expense">
                    <div className="stat-icon">📉</div>
                    <div className="stat-content">
                        <span className="stat-label">Gastos {mesActual}</span>
                        <span className="stat-value negative">{formatCurrency(resumen.gastos)}</span>
                    </div>
                </div>
                <div className="stat-card stat-net">
                    <div className="stat-icon">💵</div>
                    <div className="stat-content">
                        <span className="stat-label">Resultado Neto</span>
                        <span className={`stat-value ${resumen.balance >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(resumen.balance)}
                        </span>
                    </div>
                </div>
            </section>

            {/* Desglose por Categorías */}
            <section className="content-grid">
                <Card title="Gastos por Categoría" icon="📉">
                    {loading ? (
                        <div className="loading-placeholder">Cargando...</div>
                    ) : Object.keys(gastosPorCategoria).length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📊</span>
                            <p>No hay gastos registrados este mes</p>
                        </div>
                    ) : (
                        <div className="categoria-list">
                            {Object.entries(gastosPorCategoria)
                                .sort((a, b) => b[1] - a[1])
                                .map(([cat, monto]) => (
                                    <div key={cat} className="categoria-item">
                                        <span className="categoria-nombre">{cat}</span>
                                        <span className="categoria-monto text-error">{formatCurrency(monto)}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </Card>

                <Card title="Ingresos por Categoría" icon="📈">
                    {loading ? (
                        <div className="loading-placeholder">Cargando...</div>
                    ) : Object.keys(ingresosPorCategoria).length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📊</span>
                            <p>No hay ingresos registrados este mes</p>
                        </div>
                    ) : (
                        <div className="categoria-list">
                            {Object.entries(ingresosPorCategoria)
                                .sort((a, b) => b[1] - a[1])
                                .map(([cat, monto]) => (
                                    <div key={cat} className="categoria-item">
                                        <span className="categoria-nombre">{cat}</span>
                                        <span className="categoria-monto text-success">{formatCurrency(monto)}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </Card>
            </section>

            {/* Saldos por Cuenta */}
            <Card title="Saldos por Cuenta" icon="🏦">
                {loading ? (
                    <div className="loading-placeholder">Cargando...</div>
                ) : cuentas.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🏦</span>
                        <p>No hay cuentas registradas</p>
                    </div>
                ) : (
                    <div className="cuentas-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-3)' }}>
                        {cuentas.map((cuenta) => (
                            <div key={cuenta.id} className="cuenta-item">
                                <div className="cuenta-info">
                                    <span className="cuenta-tipo">{cuenta.tipo === 'banco' ? '🏦' : cuenta.tipo === 'efectivo' ? '💰' : '💳'}</span>
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
        </div>
    )
}

export default Reportes
