// Configuración de Supabase
// IMPORTANTE: Reemplaza SUPABASE_ANON_KEY con tu clave de Supabase

const SUPABASE_URL = 'https://lisnwnufrmflixmtzqtz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_P4U-YPqnwWN6aqR278PipQ_iKlOMxXh'; // Clave pública anon

// Inicializar cliente de Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
ESTRUCTURA DE BASE DE DATOS REQUERIDA EN SUPABASE:

1. Tabla: gastos_operacionales
   - id (uuid, primary key, default: gen_random_uuid())
   - fecha (date, not null)
   - categoria (text, not null) -- luz, agua, alquiler, internet, materiales, limpieza, mantenimiento, otros
   - descripcion (text)
   - monto (numeric, not null)
   - comprobante (text) -- URL o número de comprobante
   - created_at (timestamp with time zone, default: now())
   - user_id (uuid, references auth.users)

2. Tabla: empleados
   - id (uuid, primary key, default: gen_random_uuid())
   - nombre_completo (text, not null)
   - cargo (text, not null)
   - salario_mensual (numeric, not null)
   - fecha_ingreso (date, not null)
   - activo (boolean, default: true)
   - email (text)
   - telefono (text)
   - created_at (timestamp with time zone, default: now())

3. Tabla: pagos_sueldos
   - id (uuid, primary key, default: gen_random_uuid())
   - empleado_id (uuid, references empleados, not null)
   - fecha_pago (date, not null)
   - monto (numeric, not null)
   - periodo (text, not null) -- Ejemplo: "2024-01" para enero 2024
   - metodo_pago (text) -- efectivo, transferencia, cheque
   - observaciones (text)
   - created_at (timestamp with time zone, default: now())

4. Tabla: proveedores
   - id (uuid, primary key, default: gen_random_uuid())
   - nombre (text, not null)
   - ruc (text)
   - contacto (text)
   - telefono (text)
   - email (text)
   - direccion (text)
   - tipo (text) -- medicamentos, equipos, insumos, servicios, otros
   - activo (boolean, default: true)
   - created_at (timestamp with time zone, default: now())

5. Tabla: transacciones_proveedores
   - id (uuid, primary key, default: gen_random_uuid())
   - proveedor_id (uuid, references proveedores, not null)
   - fecha (date, not null)
   - tipo (text, not null) -- compra, pago
   - monto (numeric, not null)
   - descripcion (text)
   - comprobante (text)
   - created_at (timestamp with time zone, default: now())

6. Tabla: ganancias
   - id (uuid, primary key, default: gen_random_uuid())
   - fecha (date, not null)
   - tipo_servicio (text, not null) -- consulta, tratamiento, cirugia, estetica, otros
   - descripcion (text)
   - monto (numeric, not null)
   - paciente (text) -- Opcional, para registro interno
   - metodo_pago (text) -- efectivo, tarjeta, transferencia
   - created_at (timestamp with time zone, default: now())
   - user_id (uuid, references auth.users)

CONFIGURACIÓN DE ROW LEVEL SECURITY (RLS):

Para cada tabla, habilita RLS y crea las siguientes políticas:

-- Para todas las tablas (excepto empleados y proveedores):
-- Política de lectura:
CREATE POLICY "Usuarios autenticados pueden leer" ON [nombre_tabla]
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política de inserción:
CREATE POLICY "Usuarios autenticados pueden insertar" ON [nombre_tabla]
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política de actualización:
CREATE POLICY "Usuarios autenticados pueden actualizar" ON [nombre_tabla]
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política de eliminación:
CREATE POLICY "Usuarios autenticados pueden eliminar" ON [nombre_tabla]
  FOR DELETE USING (auth.role() = 'authenticated');

PASOS PARA CONFIGURAR:
1. Ve a tu proyecto en Supabase (https://supabase.com)
2. En el menú, selecciona "SQL Editor"
3. Crea cada tabla con el script SQL correspondiente
4. Habilita RLS en cada tabla (Authentication > Policies)
5. Configura las políticas de seguridad
6. En "Authentication" > "Providers", habilita Email como método de login
7. Copia tu URL del proyecto y la clave ANON de "Project Settings" > "API"
8. Pega esas credenciales al inicio de este archivo

ÍNDICES RECOMENDADOS (para mejorar rendimiento):
CREATE INDEX idx_gastos_fecha ON gastos_operacionales(fecha DESC);
CREATE INDEX idx_pagos_empleado ON pagos_sueldos(empleado_id);
CREATE INDEX idx_pagos_periodo ON pagos_sueldos(periodo);
CREATE INDEX idx_trans_proveedor ON transacciones_proveedores(proveedor_id);
CREATE INDEX idx_ganancias_fecha ON ganancias(fecha DESC);
*/

// Utilidades
const showLoading = () => {
    document.getElementById('loading').style.display = 'flex';
};

const hideLoading = () => {
    document.getElementById('loading').style.display = 'none';
};

const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN' // Cambia a tu moneda (USD, MXN, etc.)
    }).format(amount);
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Exportar configuración
window.supabase = supabase;
window.utils = {
    showLoading,
    hideLoading,
    showToast,
    formatCurrency,
    formatDate
};
