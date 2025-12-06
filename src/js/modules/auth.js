// Módulo de Autenticación
const AuthModule = (() => {
    let currentUser = null;

    const init = async () => {
        // Verificar si hay una sesión activa
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            showApp();
        } else {
            showLogin();
        }

        // Escuchar cambios en la autenticación
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                currentUser = session.user;
                showApp();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                showLogin();
            }
        });

        // Event listeners
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');

        window.utils.showLoading();
        errorDiv.textContent = '';

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            window.utils.showToast('Inicio de sesión exitoso', 'success');
            // showApp() será llamado automáticamente por onAuthStateChange
        } catch (error) {
            console.error('Error en login:', error);
            errorDiv.textContent = error.message || 'Error al iniciar sesión';
            window.utils.showToast('Error al iniciar sesión', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const handleLogout = async () => {
        window.utils.showLoading();
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            window.utils.showToast('Sesión cerrada correctamente', 'success');
        } catch (error) {
            console.error('Error en logout:', error);
            window.utils.showToast('Error al cerrar sesión', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const showLogin = () => {
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('app-screen').classList.remove('active');
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    };

    const showApp = () => {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('app-screen').classList.add('active');
        if (currentUser) {
            document.getElementById('user-email').textContent = currentUser.email;
        }
        // Cargar datos del dashboard
        if (window.DashboardModule) {
            window.DashboardModule.loadDashboard();
        }
    };

    const getCurrentUser = () => currentUser;

    return {
        init,
        getCurrentUser,
        showLogin,
        showApp
    };
})();

// Exportar módulo
window.AuthModule = AuthModule;
