// Módulo de Dashboard
const DashboardModule = (() => {
    let chart = null;

    const init = () => {
        // El dashboard se cargará cuando el usuario inicie sesión
    };

    const loadDashboard = async () => {
        window.utils.showLoading();
        try {
            const today = new Date();
            const currentMonth = today.toISOString().slice(0, 7);
            const startDate = `${currentMonth}-01`;
            const endDate = new Date(currentMonth + '-01');
            endDate.setMonth(endDate.getMonth() + 1);
            const endDateStr = endDate.toISOString().slice(0, 10);

            // Cargar datos del mes actual en paralelo
            const [gastosRes, sueldosRes, gananciasRes] = await Promise.all([
                supabase
                    .from('gastos_operacionales')
                    .select('monto')
                    .gte('fecha', startDate)
                    .lt('fecha', endDateStr),
                supabase
                    .from('pagos_sueldos')
                    .select('monto')
                    .eq('periodo', currentMonth),
                supabase
                    .from('ganancias')
                    .select('monto')
                    .gte('fecha', startDate)
                    .lt('fecha', endDateStr)
            ]);

            // Calcular totales
            const totalGastos = (gastosRes.data || []).reduce((sum, item) => sum + parseFloat(item.monto), 0);
            const totalSueldos = (sueldosRes.data || []).reduce((sum, item) => sum + parseFloat(item.monto), 0);
            const totalGanancias = (gananciasRes.data || []).reduce((sum, item) => sum + parseFloat(item.monto), 0);
            const balance = totalGanancias - (totalGastos + totalSueldos);

            // Actualizar estadísticas
            document.getElementById('stat-gastos').textContent = window.utils.formatCurrency(totalGastos);
            document.getElementById('stat-sueldos').textContent = window.utils.formatCurrency(totalSueldos);
            document.getElementById('stat-ganancias').textContent = window.utils.formatCurrency(totalGanancias);
            document.getElementById('stat-balance').textContent = window.utils.formatCurrency(balance);
            
            // Aplicar color al balance
            const balanceElement = document.getElementById('stat-balance');
            balanceElement.className = 'stat-value';
            if (balance > 0) {
                balanceElement.classList.add('positive');
            } else if (balance < 0) {
                balanceElement.classList.add('negative');
            }

            // Cargar gráfico
            await loadChart();

        } catch (error) {
            console.error('Error cargando dashboard:', error);
            window.utils.showToast('Error al cargar dashboard', 'error');
        } finally {
            window.utils.hideLoading();
        }
    };

    const loadChart = async () => {
        try {
            // Obtener datos de los últimos 6 meses
            const months = [];
            const today = new Date();
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthStr = date.toISOString().slice(0, 7);
                months.push(monthStr);
            }

            // Cargar datos para cada mes
            const promises = months.map(async (month) => {
                const startDate = `${month}-01`;
                const endDate = new Date(month + '-01');
                endDate.setMonth(endDate.getMonth() + 1);
                const endDateStr = endDate.toISOString().slice(0, 10);

                const [gastosRes, sueldosRes, gananciasRes] = await Promise.all([
                    supabase
                        .from('gastos_operacionales')
                        .select('monto')
                        .gte('fecha', startDate)
                        .lt('fecha', endDateStr),
                    supabase
                        .from('pagos_sueldos')
                        .select('monto')
                        .eq('periodo', month),
                    supabase
                        .from('ganancias')
                        .select('monto')
                        .gte('fecha', startDate)
                        .lt('fecha', endDateStr)
                ]);

                return {
                    month,
                    gastos: (gastosRes.data || []).reduce((sum, item) => sum + parseFloat(item.monto), 0),
                    sueldos: (sueldosRes.data || []).reduce((sum, item) => sum + parseFloat(item.monto), 0),
                    ganancias: (gananciasRes.data || []).reduce((sum, item) => sum + parseFloat(item.monto), 0)
                };
            });

            const data = await Promise.all(promises);

            // Formatear labels de meses
            const labels = data.map(d => {
                const [year, month] = d.month.split('-');
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                return `${monthNames[parseInt(month) - 1]} ${year}`;
            });

            // Destruir gráfico anterior si existe
            if (chart) {
                chart.destroy();
            }

            // Crear nuevo gráfico
            const ctx = document.getElementById('monthlyChart').getContext('2d');
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Ganancias',
                            data: data.map(d => d.ganancias),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Gastos Operacionales',
                            data: data.map(d => d.gastos),
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Sueldos',
                            data: data.map(d => d.sueldos),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Evolución Financiera - Últimos 6 Meses'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += new Intl.NumberFormat('es-PE', {
                                        style: 'currency',
                                        currency: 'PEN'
                                    }).format(context.parsed.y);
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return new Intl.NumberFormat('es-PE', {
                                        style: 'currency',
                                        currency: 'PEN',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(value);
                                }
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error cargando gráfico:', error);
        }
    };

    return {
        init,
        loadDashboard
    };
})();

window.DashboardModule = DashboardModule;
