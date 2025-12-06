import { useState, useEffect } from 'react'
import { Button, Card, Table, Modal, Input, Select } from '../../components/UI'
import { liquidacionService, trabajadorService } from '../../services/supabaseServices'
import { formatCurrency, getMonthName } from '../../utils/helpers'
import '../Transacciones/Transacciones.css'

const Liquidaciones = () => {
    const [loading, setLoading] = useState(true)
    const [liquidaciones, setLiquidaciones] = useState([])
    const [trabajadores, setTrabajadores] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        trabajador_id: '',
        periodo_year: new Date().getFullYear(),
        periodo_month: new Date().getMonth() + 1,
        sueldo_base: 0,
        dias_trabajados: 30
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [liqRes, trabRes] = await Promise.all([
            liquidacionService.getLiquidaciones(),
            trabajadorService.getTrabajadores()
        ])
        setLiquidaciones(liqRes.data || [])
        setTrabajadores(trabRes.data || [])
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.trabajador_id) {
            alert('Selecciona un trabajador')
            return
        }

        setSaving(true)

        const sueldo = Number(formData.sueldo_base)
        const afp = sueldo * 0.1025
        const salud = sueldo * 0.07
        const seguro = sueldo * 0.006
        const totalDescuentos = afp + salud + seguro
        const totalHaberes = sueldo

        console.log('Creando liquidación para trabajador:', formData.trabajador_id)

        const { data, error } = await liquidacionService.createLiquidacion({
            trabajador_id: formData.trabajador_id,
            periodo_year: formData.periodo_year,
            periodo_month: formData.periodo_month,
            dias_trabajados: Number(formData.dias_trabajados),
            sueldo_base: sueldo,
            total_haberes: totalHaberes,
            afp,
            salud,
            seguro_cesantia: seguro,
            total_descuentos: totalDescuentos,
            sueldo_liquido: totalHaberes - totalDescuentos,
            estado: 'borrador'
        })

        if (error) {
            console.error('Error al crear liquidación:', error)
            alert('Error: ' + (error.message || JSON.stringify(error)))
        } else {
            console.log('Liquidación creada:', data)
            setShowModal(false)
            setFormData({
                trabajador_id: '',
                periodo_year: new Date().getFullYear(),
                periodo_month: new Date().getMonth() + 1,
                sueldo_base: 0,
                dias_trabajados: 30
            })
            loadData()
        }
        setSaving(false)
    }

    const columns = [
        {
            key: 'trabajador',
            label: 'Trabajador',
            render: (val) => val ? `${val.nombre} ${val.apellido_paterno}` : '-'
        },
        {
            key: 'periodo',
            label: 'Período',
            render: (_, row) => `${getMonthName(row.periodo_month)} ${row.periodo_year}`
        },
        { key: 'total_haberes', label: 'Haberes', align: 'right', render: (val) => formatCurrency(val) },
        { key: 'total_descuentos', label: 'Descuentos', align: 'right', render: (val) => <span className="text-error">-{formatCurrency(val)}</span> },
        { key: 'sueldo_liquido', label: 'Líquido', align: 'right', render: (val) => <span className="text-success">{formatCurrency(val)}</span> },
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

    return (
        <div className="page-transacciones">
            <header className="page-header">
                <div>
                    <h1>Liquidaciones de Sueldo</h1>
                    <p>Gestiona las remuneraciones de tus trabajadores</p>
                </div>
                <Button icon="➕" onClick={() => setShowModal(true)}>
                    Nueva Liquidación
                </Button>
            </header>

            <Card padding="none">
                <Table columns={columns} data={liquidaciones} loading={loading} emptyMessage="No hay liquidaciones registradas" emptyIcon="📋" />
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Liquidación" size="md">
                <form onSubmit={handleSubmit} className="form-transaccion">
                    <Select
                        label="Trabajador"
                        value={formData.trabajador_id}
                        onChange={(e) => {
                            const trab = trabajadores.find(t => t.id === e.target.value)
                            setFormData({
                                ...formData,
                                trabajador_id: e.target.value,
                                sueldo_base: trab?.salario_base || 0
                            })
                        }}
                        options={trabajadores.map(t => ({
                            value: t.id,
                            label: `${t.nombre} ${t.apellido_paterno} - ${t.rut}`
                        }))}
                        required
                    />
                    <div className="form-row">
                        <Select
                            label="Mes"
                            value={formData.periodo_month}
                            onChange={(e) => setFormData({ ...formData, periodo_month: Number(e.target.value) })}
                            options={Array.from({ length: 12 }, (_, i) => ({
                                value: i + 1,
                                label: getMonthName(i + 1)
                            }))}
                        />
                        <Input
                            label="Año"
                            type="number"
                            value={formData.periodo_year}
                            onChange={(e) => setFormData({ ...formData, periodo_year: Number(e.target.value) })}
                        />
                    </div>
                    <div className="form-row">
                        <Input
                            label="Sueldo Base"
                            type="number"
                            value={formData.sueldo_base}
                            onChange={(e) => setFormData({ ...formData, sueldo_base: e.target.value })}
                        />
                        <Input
                            label="Días Trabajados"
                            type="number"
                            value={formData.dias_trabajados}
                            onChange={(e) => setFormData({ ...formData, dias_trabajados: e.target.value })}
                        />
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>Generar Liquidación</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Liquidaciones
