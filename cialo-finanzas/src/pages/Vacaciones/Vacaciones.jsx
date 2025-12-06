import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select, Textarea } from '../../components/UI'
import { vacacionService, trabajadorService } from '../../services/supabaseServices'
import { formatDate, getToday } from '../../utils/helpers'
import '../Departamentos/Departamentos.css'

const Vacaciones = () => {
    const [loading, setLoading] = useState(true)
    const [vacaciones, setVacaciones] = useState([])
    const [trabajadores, setTrabajadores] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        trabajador_id: '',
        fecha_inicio: getToday(),
        fecha_fin: '',
        dias_habiles: '',
        dias_acumulados_usados: '',
        observaciones: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [vacRes, trabRes] = await Promise.all([
            vacacionService.getVacaciones(),
            trabajadorService.getTrabajadores()
        ])
        setVacaciones(vacRes.data || [])
        setTrabajadores(trabRes.data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.trabajador_id || !formData.fecha_inicio || !formData.fecha_fin) {
            alert('Completa los campos requeridos')
            return
        }
        setSaving(true)
        const { data, error } = await vacacionService.createVacacion({
            ...formData,
            dias_habiles: Number(formData.dias_habiles) || 0,
            dias_acumulados_usados: Number(formData.dias_acumulados_usados) || 0,
            estado: 'pendiente'
        })
        if (error) {
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            setShowModal(false)
            setFormData({ trabajador_id: '', fecha_inicio: getToday(), fecha_fin: '', dias_habiles: '', dias_acumulados_usados: '', observaciones: '' })
            loadData()
        }
        setSaving(false)
    }

    const getEstadoBadge = (estado) => {
        const colors = {
            pendiente: 'badge-gasto',
            aprobada: 'badge-ingreso',
            rechazada: 'badge-error',
            tomada: 'badge-info',
            cancelada: 'badge-muted'
        }
        return <span className={`badge ${colors[estado] || ''}`}>{estado}</span>
    }

    const columns = [
        { key: 'trabajador', label: 'Trabajador', render: (val) => val ? `${val.nombre} ${val.apellido_paterno}` : '-' },
        { key: 'fecha_inicio', label: 'Desde', render: (val) => formatDate(val) },
        { key: 'fecha_fin', label: 'Hasta', render: (val) => formatDate(val) },
        { key: 'dias_habiles', label: 'Días', width: '80px' },
        { key: 'estado', label: 'Estado', render: (val) => getEstadoBadge(val) }
    ]

    return (
        <div className="page-departamentos">
            <header className="page-header">
                <div>
                    <h1>Vacaciones</h1>
                    <p>Solicitudes de vacaciones del personal</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    <span className="btn-text-full">Nueva Solicitud</span>
                    <span className="btn-text-short">Nueva</span>
                </Button>
            </header>

            <div className="total-banner">
                <span className="total-icon">🏖️</span>
                <span className="total-text">{vacaciones.filter(v => v.estado === 'pendiente').length} solicitudes pendientes</span>
            </div>

            <div className="desktop-view">
                <Card padding="none">
                    <Table columns={columns} data={vacaciones} loading={loading} emptyMessage="No hay solicitudes" emptyIcon="🏖️" />
                </Card>
            </div>

            <div className="mobile-view">
                {loading ? (
                    <div className="loading-state"><p>Cargando...</p></div>
                ) : vacaciones.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🏖️</span>
                        <p>No hay solicitudes</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Agregar</Button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {vacaciones.map((v) => (
                            <div key={v.id} className="item-card">
                                <div className="item-card-header">
                                    <span className="item-icon">🏖️</span>
                                    <div className="item-info">
                                        <span className="item-name">{v.trabajador?.nombre} {v.trabajador?.apellido_paterno}</span>
                                        <span className="item-desc">{formatDate(v.fecha_inicio)} - {formatDate(v.fecha_fin)}</span>
                                    </div>
                                </div>
                                <div className="item-footer">
                                    {getEstadoBadge(v.estado)}
                                    <span style={{ marginLeft: 'auto' }}>{v.dias_habiles} días</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Solicitud de Vacaciones" size="md">
                <form onSubmit={handleSubmit} className="form-simple">
                    <Select
                        label="Trabajador"
                        value={formData.trabajador_id}
                        onChange={(e) => setFormData({ ...formData, trabajador_id: e.target.value })}
                        options={trabajadores.map(t => ({ value: t.id, label: `${t.nombre} ${t.apellido_paterno}` }))}
                        required
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="Fecha Inicio" type="date" value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} required />
                        <Input label="Fecha Fin" type="date" value={formData.fecha_fin} onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="Días Hábiles" type="number" value={formData.dias_habiles} onChange={(e) => setFormData({ ...formData, dias_habiles: e.target.value })} />
                        <Input label="Días Acumulados Usados" type="number" value={formData.dias_acumulados_usados} onChange={(e) => setFormData({ ...formData, dias_acumulados_usados: e.target.value })} />
                    </div>
                    <Textarea label="Observaciones" value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} rows={2} />
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Vacaciones
