// Aplicación Principal
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar módulos
    AuthModule.init();
    GastosModule.init();
    SueldosModule.init();
    ProveedoresModule.init();
    GananciasModule.init();
    DashboardModule.init();

    // Navegación entre vistas
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });

    // Modal
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/public/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('Error registrando Service Worker:', error);
            });
    }
});

const switchView = (viewName) => {
    // Actualizar navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Actualizar vista
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');

    // Cargar datos según la vista
    switch(viewName) {
        case 'dashboard':
            DashboardModule.loadDashboard();
            break;
        case 'gastos':
            GastosModule.loadGastos();
            break;
        case 'sueldos':
            SueldosModule.loadEmpleados();
            break;
        case 'proveedores':
            ProveedoresModule.loadProveedores();
            break;
        case 'ganancias':
            GananciasModule.loadGanancias();
            break;
    }
};

const closeModal = () => {
    document.getElementById('modal').style.display = 'none';
};

// Exportar funciones globales
window.switchView = switchView;
window.closeModal = closeModal;
