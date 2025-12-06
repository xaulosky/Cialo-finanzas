-- Script de configuración de Base de Datos para Cialo Finanzas
-- Ejecuta este script en el SQL Editor de Supabase

-- =====================================================
-- 1. TABLA: gastos_operacionales
-- =====================================================
CREATE TABLE IF NOT EXISTS gastos_operacionales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('luz', 'agua', 'alquiler', 'internet', 'materiales', 'limpieza', 'mantenimiento', 'otros')),
    descripcion TEXT,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    comprobante TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_gastos_fecha ON gastos_operacionales(fecha DESC);
CREATE INDEX idx_gastos_categoria ON gastos_operacionales(categoria);
CREATE INDEX idx_gastos_created ON gastos_operacionales(created_at DESC);

-- =====================================================
-- 2. TABLA: empleados
-- =====================================================
CREATE TABLE IF NOT EXISTS empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo TEXT NOT NULL,
    cargo TEXT NOT NULL,
    salario_mensual NUMERIC(10, 2) NOT NULL CHECK (salario_mensual >= 0),
    fecha_ingreso DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    email TEXT,
    telefono TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_empleados_activo ON empleados(activo);
CREATE INDEX idx_empleados_nombre ON empleados(nombre_completo);

-- =====================================================
-- 3. TABLA: pagos_sueldos
-- =====================================================
CREATE TABLE IF NOT EXISTS pagos_sueldos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID REFERENCES empleados(id) ON DELETE CASCADE NOT NULL,
    fecha_pago DATE NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    periodo TEXT NOT NULL, -- Formato: "YYYY-MM" ejemplo: "2024-01"
    metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'transferencia', 'cheque', '')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pagos_empleado ON pagos_sueldos(empleado_id);
CREATE INDEX idx_pagos_periodo ON pagos_sueldos(periodo);
CREATE INDEX idx_pagos_fecha ON pagos_sueldos(fecha_pago DESC);

-- =====================================================
-- 4. TABLA: proveedores
-- =====================================================
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    ruc TEXT,
    contacto TEXT,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    tipo TEXT CHECK (tipo IN ('medicamentos', 'equipos', 'insumos', 'servicios', 'limpieza', 'otros', '')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_proveedores_activo ON proveedores(activo);
CREATE INDEX idx_proveedores_nombre ON proveedores(nombre);
CREATE INDEX idx_proveedores_tipo ON proveedores(tipo);

-- =====================================================
-- 5. TABLA: transacciones_proveedores
-- =====================================================
CREATE TABLE IF NOT EXISTS transacciones_proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor_id UUID REFERENCES proveedores(id) ON DELETE CASCADE NOT NULL,
    fecha DATE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'pago')),
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    descripcion TEXT,
    comprobante TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_trans_proveedor ON transacciones_proveedores(proveedor_id);
CREATE INDEX idx_trans_fecha ON transacciones_proveedores(fecha DESC);
CREATE INDEX idx_trans_tipo ON transacciones_proveedores(tipo);

-- =====================================================
-- 6. TABLA: ganancias
-- =====================================================
CREATE TABLE IF NOT EXISTS ganancias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    tipo_servicio TEXT NOT NULL CHECK (tipo_servicio IN ('consulta', 'tratamiento', 'cirugia', 'estetica', 'otros')),
    descripcion TEXT,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    paciente TEXT,
    metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'yape', 'otro', '')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_ganancias_fecha ON ganancias(fecha DESC);
CREATE INDEX idx_ganancias_tipo ON ganancias(tipo_servicio);
CREATE INDEX idx_ganancias_created ON ganancias(created_at DESC);

-- =====================================================
-- CONFIGURACIÓN DE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE gastos_operacionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_sueldos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones_proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ganancias ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD - gastos_operacionales
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver gastos" 
    ON gastos_operacionales FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar gastos" 
    ON gastos_operacionales FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar gastos" 
    ON gastos_operacionales FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar gastos" 
    ON gastos_operacionales FOR DELETE 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS DE SEGURIDAD - empleados
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver empleados" 
    ON empleados FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar empleados" 
    ON empleados FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar empleados" 
    ON empleados FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar empleados" 
    ON empleados FOR DELETE 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS DE SEGURIDAD - pagos_sueldos
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver pagos" 
    ON pagos_sueldos FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar pagos" 
    ON pagos_sueldos FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar pagos" 
    ON pagos_sueldos FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar pagos" 
    ON pagos_sueldos FOR DELETE 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS DE SEGURIDAD - proveedores
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver proveedores" 
    ON proveedores FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar proveedores" 
    ON proveedores FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar proveedores" 
    ON proveedores FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar proveedores" 
    ON proveedores FOR DELETE 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS DE SEGURIDAD - transacciones_proveedores
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver transacciones" 
    ON transacciones_proveedores FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar transacciones" 
    ON transacciones_proveedores FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar transacciones" 
    ON transacciones_proveedores FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar transacciones" 
    ON transacciones_proveedores FOR DELETE 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS DE SEGURIDAD - ganancias
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver ganancias" 
    ON ganancias FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar ganancias" 
    ON ganancias FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar ganancias" 
    ON ganancias FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar ganancias" 
    ON ganancias FOR DELETE 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- DATOS DE PRUEBA (Opcional)
-- =====================================================

-- Puedes descomentar las siguientes líneas para insertar datos de ejemplo

INSERT INTO empleados (nombre_completo, cargo, salario_mensual, fecha_ingreso, email, telefono) VALUES
('Dr. Juan Pérez', 'Médico General', 3500.00, '2023-01-15', 'jperez@cialo.com', '555-1234'),
('María González', 'Enfermera', 1800.00, '2023-02-01', 'mgonzalez@cialo.com', '555-5678'),
('Ana Torres', 'Recepcionista', 1200.00, '2023-03-10', 'atorres@cialo.com', '555-9012');

INSERT INTO proveedores (nombre, ruc, contacto, telefono, tipo) VALUES
('Farmacia MediSupply', '20123456789', 'Carlos Ruiz', '555-1111', 'medicamentos'),
('Equipos Médicos SAC', '20987654321', 'Laura Vega', '555-2222', 'equipos'),
('Limpieza Total', '20456789123', 'Pedro Sánchez', '555-3333', 'limpieza');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- NOTA: Después de ejecutar este script:
-- 1. Ve a Authentication > Providers y habilita "Email"
-- 2. Crea tu primer usuario en Authentication > Users
-- 3. Configura las credenciales en src/js/config.js
