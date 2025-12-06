import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select, Textarea } from '../../components/UI'
import { licenciaService, trabajadorService } from '../../services/supabaseServices'
import { formatDate, getToday } from '../../utils/helpers'
import '../Departamentos/Departamentos.css'

const Licencias = () => {
    const [loading, setLoading] = useState(true)
    const [licencias, setLicencias] = useState([])
    const [trabajadores, setTrabajadores] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        trabajador_id: '',
        tipo: 'enfermedad',
        fecha_inicio: getToday(),
        fecha_fin: '',
        dias: '',
        diagnostico: '',
        medico: '',
        institucion: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [licRes, trabRes] = await Promise.all([
            licenciaService.getLicencias(),
            trabajadorService.getTrabajadores()
        ])
        setLicencias(licRes.data || [])
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
        const { data, error } = await licenciaService.createLicencia({
            ...formData,
            dias: Number(formData.dias) || 0,
            estado: 'pendiente'
        })
        if (error) {
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            setShowModal(false)
            setFormData({ trabajador_id: '', tipo: 'enfermedad', fecha_inicio: getToday(), fecha_fin: '', dias: '', diagnostico: '', medico: '', institucion: '' })
            loadData()
        }
        setSaving(false)
    }

    const tipoLabels = {
        enfermedad: '🏥 Enfermedad',
        accidente_trabajo: '⚠️ Accidente Laboral',
        maternal: '👶 Maternal',
        paternal: '👨‍👦 Paternal',
        otro: '📋 Otro'
    }

    const columns = [
        { key: 'trabajador', label: 'Trabajador', render: (val) => val ? `${val.nombre} ${val.apellido_paterno}` : '-' },
        { key: 'tipo', label: 'Tipo', render: (val) => tipoLabels[val] || val },
        { key: 'fecha_inicio', label: 'Desde', render: (val) => formatDate(val) },
        { key: 'fecha_fin', label: 'Hasta', render: (val) => formatDate(val) },
        { key: 'dias', label: 'Días', width: '80px' },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => <span className={`badge ${val === 'aprobada' ? 'badge-ingreso' : 'badge-gasto'}`}>{val}</span>
        }
    ]

    return (
        <div className="page-departamentos">
            <header className="page-header">
                <div>
                    <h1>Licencias Médicas</h1>
                    <p>Registro de licencias del personal</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    <span className="btn-text-full">Nueva Licencia</span>
                    <span className="btn-text-short">Nueva</span>
                </Button>
            </header>

            <div className="total-banner">
                <span className="total-icon">🏥</span>
                <span className="total-text">{licencias.length} licencias registradas</span>
            </div>

            <div className="desktop-view">
                <Card padding="none">
                    <Table columns={columns} data={licencias} loading={loading} emptyMessage="No hay licencias" emptyIcon="🏥" />
                </Card>
            </div>

            <div className="mobile-view">
                {loading ? (
                    <div className="loading-state"><p>Cargando...</p></div>
                ) : licencias.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🏥</span>
                        <p>No hay licencias</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Agregar</Button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {licencias.map((l) => (
                            <div key={l.id} className="item-card">
                                <div className="item-card-header">
                                    <span className="item-icon">🏥</span>
                                    <div className="item-info">
                                        <span className="item-name">{l.trabajador?.nombre} {l.trabajador?.apellido_paterno}</span>
                                        <span className="item-desc">{tipoLabels[l.tipo] || l.tipo}</span>
                                    </div>
                                </div>
                                <div className="item-footer">
                                    <span>{formatDate(l.fecha_inicio)} - {formatDate(l.fecha_fin)}</span>
                                    <span style={{ marginLeft: 'auto' }}>{l.dias} días</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Licencia Médica" size="lg">
                <form onSubmit={handleSubmit} className="form-simple">
                    <Select
                        label="Trabajador"
                        value={formData.trabajador_id}
                        onChange={(e) => setFormData({ ...formData, trabajador_id: e.target.value })}
                        options={trabajadores.map(t => ({ value: t.id, label: `${t.nombre} ${t.apellido_paterno}` }))}
                        required
                    />
                    <Select
                        label="Tipo de Licencia"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        options={Object.entries(tipoLabels).map(([value, label]) => ({ value, label }))}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="Fecha Inicio" type="date" value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} required />
                        <Input label="Fecha Fin" type="date" value={formData.fecha_fin} onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })} required />
                        <Input label="Días" type="number" value={formData.dias} onChange={(e) => setFormData({ ...formData, dias: e.target.value })} />
                    </div>
                    <Textarea label="Diagnóstico" value={formData.diagnostico} onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })} rows={2} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <Input label="Médico" value={formData.medico} onChange={(e) => setFormData({ ...formData, medico: e.target.value })} />
                        <Input label="Institución" value={formData.institucion} onChange={(e) => setFormData({ ...formData, institucion: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Licencias
