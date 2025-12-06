import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout/Layout'

// Pages
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Transacciones from './pages/Transacciones/Transacciones'
import Cuentas from './pages/Cuentas/Cuentas'
import Categorias from './pages/Categorias/Categorias'
import Proveedores from './pages/Proveedores/Proveedores'
import Clientes from './pages/Clientes/Clientes'
import Trabajadores from './pages/Trabajadores/Trabajadores'
import Liquidaciones from './pages/Liquidaciones/Liquidaciones'
import FacturasCompra from './pages/FacturasCompra/FacturasCompra'
import FacturasVenta from './pages/FacturasVenta/FacturasVenta'
import Reportes from './pages/Reportes/Reportes'
import Configuracion from './pages/Configuracion/Configuracion'

// Nuevas páginas
import Departamentos from './pages/Departamentos/Departamentos'
import Cargos from './pages/Cargos/Cargos'
import Vacaciones from './pages/Vacaciones/Vacaciones'
import Licencias from './pages/Licencias/Licencias'
import ConceptosNomina from './pages/ConceptosNomina/ConceptosNomina'
import CentrosCosto from './pages/CentrosCosto/CentrosCosto'
import Proyectos from './pages/Proyectos/Proyectos'
import Presupuestos from './pages/Presupuestos/Presupuestos'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transacciones" element={<Transacciones />} />
            <Route path="cuentas" element={<Cuentas />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="proveedores" element={<Proveedores />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="trabajadores" element={<Trabajadores />} />
            <Route path="liquidaciones" element={<Liquidaciones />} />
            <Route path="facturas-compra" element={<FacturasCompra />} />
            <Route path="facturas-venta" element={<FacturasVenta />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="configuracion" element={<Configuracion />} />
            {/* Nuevas rutas */}
            <Route path="departamentos" element={<Departamentos />} />
            <Route path="cargos" element={<Cargos />} />
            <Route path="vacaciones" element={<Vacaciones />} />
            <Route path="licencias" element={<Licencias />} />
            <Route path="conceptos-nomina" element={<ConceptosNomina />} />
            <Route path="centros-costo" element={<CentrosCosto />} />
            <Route path="proyectos" element={<Proyectos />} />
            <Route path="presupuestos" element={<Presupuestos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
