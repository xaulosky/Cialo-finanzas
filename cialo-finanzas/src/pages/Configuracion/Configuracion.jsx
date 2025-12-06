import { Card, Button } from '../../components/UI'
import '../Dashboard/Dashboard.css'

const Configuracion = () => {
    return (
        <div className="dashboard">
            <header className="page-header">
                <div>
                    <h1>Configuración</h1>
                    <p>Ajusta la configuración de tu sistema</p>
                </div>
            </header>

            <section className="content-grid">
                <Card title="Empresa" icon="🏢">
                    <div className="empty-state">
                        <span className="empty-icon">🏢</span>
                        <p>Configura los datos de tu empresa</p>
                        <Button variant="outline" size="sm">Editar empresa</Button>
                    </div>
                </Card>

                <Card title="Usuarios" icon="👥">
                    <div className="empty-state">
                        <span className="empty-icon">👥</span>
                        <p>Gestiona los usuarios del sistema</p>
                        <Button variant="outline" size="sm">Ver usuarios</Button>
                    </div>
                </Card>

                <Card title="Departamentos" icon="🏛️">
                    <div className="empty-state">
                        <span className="empty-icon">🏛️</span>
                        <p>Configura los departamentos</p>
                        <Button variant="outline" size="sm">Ver departamentos</Button>
                    </div>
                </Card>

                <Card title="Cargos" icon="💼">
                    <div className="empty-state">
                        <span className="empty-icon">💼</span>
                        <p>Configura los cargos laborales</p>
                        <Button variant="outline" size="sm">Ver cargos</Button>
                    </div>
                </Card>
            </section>
        </div>
    )
}

export default Configuracion
