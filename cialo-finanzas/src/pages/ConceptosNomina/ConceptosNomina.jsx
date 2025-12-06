import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select, Textarea } from '../../components/UI'
import { conceptoNominaService } from '../../services/supabaseServices'
import { formatCurrency } from '../../utils/helpers'
import '../Departamentos/Departamentos.css'

const ConceptosNomina = () => {
    const [loading, setLoading] = useState(true)
    const [conceptos, setConceptos] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        tipo: 'haber',
        es_imponible: true,
        es_tributable: true,
        es_fijo: false,
        valor_defecto: ''
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const { data } = await conceptoNominaService.getConceptos()
        setConceptos(data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.codigo.trim() || !formData.nombre.trim()) {
            alert('Código y nombre son requeridos')
            return
        }
        setSaving(true)
        const { data, error } = await conceptoNominaService.createConcepto({
            ...formData,
            valor_defecto: formData.valor_defecto ? Number(formData.valor_defecto) : null
        })
        if (error) {
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            setShowModal(false)
            setFormData({ codigo: '', nombre: '', tipo: 'haber', es_imponible: true, es_tributable: true, es_fijo: false, valor_defecto: '' })
            loadData()
        }
        setSaving(false)
    }

    const haberes = conceptos.filter(c => c.tipo === 'haber')
    const descuentos = conceptos.filter(c => c.tipo === 'descuento')

    const columns = [
        { key: 'codigo', label: 'Código', width: '100px' },
        { key: 'nombre', label: 'Nombre' },
        {
            key: 'tipo',
            label: 'Tipo',
            render: (val) => <span className={`badge ${val === 'haber' ? 'badge-ingreso' : 'badge-gasto'}`}>{val === 'haber' ? '➕ Haber' : '➖ Descuento'}</span>
        },
        { key: 'valor_defecto', label: 'Valor Defecto', align: 'right', render: (val) => val ? formatCurrency(val) : '-' },
        { key: 'es_imponible', label: 'Imponible', width: '100px', render: (val) => val ? '✅' : '❌' }
    ]

    return (
        <div className="page-departamentos">
            <header className="page-header">
                <div>
                    <h1>Conceptos de Nómina</h1>
                    <p>Haberes y descuentos para liquidaciones</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    <span className="btn-text-full">Nuevo Concepto</span>
                    <span className="btn-text-short">Nuevo</span>
                </Button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                <div className="total-banner" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                    <span className="total-icon">➕</span>
                    <span className="total-text">{haberes.length} haberes</span>
                </div>
                <div className="total-banner" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <span className="total-icon">➖</span>
                    <span className="total-text">{descuentos.length} descuentos</span>
                </div>
            </div>

            <div className="desktop-view">
                <Card padding="none">
                    <Table columns={columns} data={conceptos} loading={loading} emptyMessage="No hay conceptos" emptyIcon="📋" />
                </Card>
            </div>

            <div className="mobile-view">
                {loading ? (
                    <div className="loading-state"><p>Cargando...</p></div>
                ) : conceptos.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📋</span>
                        <p>No hay conceptos</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>+ Agregar</Button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {conceptos.map((c) => (
                            <div key={c.id} className="item-card">
                                <div className="item-card-header">
                                    <span className="item-icon">{c.tipo === 'haber' ? '➕' : '➖'}</span>
                                    <div className="item-info">
                                        <span className="item-name">{c.nombre}</span>
                                        <span className="item-desc">{c.codigo}</span>
                                    </div>
                                </div>
                                <div className="item-footer">
                                    <span className={`badge ${c.tipo === 'haber' ? 'badge-ingreso' : 'badge-gasto'}`}>{c.tipo}</span>
                                    {c.valor_defecto && <span style={{ marginLeft: 'auto' }}>{formatCurrency(c.valor_defecto)}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Concepto de Nómina" size="md">
                <form onSubmit={handleSubmit} className="form-simple">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-4)' }}>
                        <Input label="Código" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} required />
                        <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                    </div>
                    <Select
                        label="Tipo"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        options={[
                            { value: 'haber', label: '➕ Haber' },
                            { value: 'descuento', label: '➖ Descuento' }
                        ]}
                    />
                    <Input label="Valor por Defecto" type="number" value={formData.valor_defecto} onChange={(e) => setFormData({ ...formData, valor_defecto: e.target.value })} />
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Guardar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default ConceptosNomina
