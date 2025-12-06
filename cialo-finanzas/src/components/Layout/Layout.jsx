import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Layout.css'

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Cerrar sidebar al cambiar de ruta en móvil
    useEffect(() => {
        setSidebarOpen(false)
    }, [location.pathname])

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const menuItems = [
        { path: '/', icon: '📊', label: 'Dashboard' },
        { path: '/transacciones', icon: '💸', label: 'Transacciones' },
        { path: '/cuentas', icon: '🏦', label: 'Cuentas' },
        { path: '/categorias', icon: '🏷️', label: 'Categorías' },
        { divider: true },
        { path: '/proveedores', icon: '🏭', label: 'Proveedores' },
        { path: '/clientes', icon: '👥', label: 'Clientes' },
        { divider: true },
        { path: '/trabajadores', icon: '👷', label: 'Trabajadores' },
        { path: '/liquidaciones', icon: '📋', label: 'Liquidaciones' },
        { divider: true },
        { path: '/facturas-compra', icon: '📥', label: 'Facturas Compra' },
        { path: '/facturas-venta', icon: '📤', label: 'Facturas Venta' },
        { divider: true },
        { path: '/reportes', icon: '📈', label: 'Reportes' },
        { path: '/configuracion', icon: '⚙️', label: 'Configuración' },
    ]

    // Navegación rápida para barra inferior móvil
    const quickNav = [
        { path: '/', icon: '📊', label: 'Inicio' },
        { path: '/transacciones', icon: '💸', label: 'Transacciones' },
        { path: '/cuentas', icon: '🏦', label: 'Cuentas' },
        { path: '/reportes', icon: '📈', label: 'Reportes' },
    ]

    return (
        <div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div className="mobile-logo">
                    <span className="logo-icon">💰</span>
                    <span className="logo-text">Cialo Finanzas</span>
                </div>
                <div className="mobile-avatar" onClick={() => navigate('/configuracion')}>
                    {user?.email?.charAt(0).toUpperCase()}
                </div>
            </header>

            {/* Overlay para móvil */}
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon">💰</span>
                        {!sidebarCollapsed && <span className="logo-text">Cialo Finanzas</span>}
                    </div>
                    <button className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)}>
                        ✕
                    </button>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? 'Expandir' : 'Colapsar'}
                    >
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item, index) =>
                        item.divider ? (
                            <div key={index} className="nav-divider" />
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                            </NavLink>
                        )
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="user-details">
                                <span className="user-email">{user?.email}</span>
                                <span className="user-role">Administrador</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="btn-logout"
                        onClick={handleSignOut}
                        title="Cerrar sesión"
                    >
                        {sidebarCollapsed ? '🚪' : 'Salir'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* Bottom Navigation - Mobile */}
            <nav className="bottom-nav">
                {quickNav.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="bottom-nav-icon">{item.icon}</span>
                        <span className="bottom-nav-label">{item.label}</span>
                    </NavLink>
                ))}
                <button className="bottom-nav-item" onClick={() => setSidebarOpen(true)}>
                    <span className="bottom-nav-icon">☰</span>
                    <span className="bottom-nav-label">Menú</span>
                </button>
            </nav>
        </div>
    )
}

export default Layout
