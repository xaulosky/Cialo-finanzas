-- =====================================================
-- CIALO FINANZAS - ESQUEMA DE BASE DE DATOS
-- Sistema completo de gestión financiera empresarial
-- Para ejecutar en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. EXTENSIONES Y CONFIGURACIÓN INICIAL
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABLAS DE CONFIGURACIÓN Y CATÁLOGOS
-- =====================================================

-- Empresa/Organización (multitenancy ready)
CREATE TABLE public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE,
    giro VARCHAR(255),
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    moneda_principal VARCHAR(3) DEFAULT 'CLP',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles de usuario (extiende auth.users de Supabase)
CREATE TABLE public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
    nombre_completo VARCHAR(255),
    avatar_url TEXT,
    rol VARCHAR(50) DEFAULT 'usuario', -- admin, contador, usuario
    telefono VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías de transacciones (ingresos/gastos)
CREATE TABLE public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'gasto', 'transferencia')),
    descripcion TEXT,
    color VARCHAR(7), -- Hex color
    icono VARCHAR(50),
    padre_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL, -- Subcategorías
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cuentas bancarias y cajas
CREATE TABLE public.cuentas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('banco', 'caja', 'efectivo', 'tarjeta_credito', 'inversion', 'otro')),
    banco VARCHAR(100),
    numero_cuenta VARCHAR(50),
    moneda VARCHAR(3) DEFAULT 'CLP',
    saldo_inicial DECIMAL(18,2) DEFAULT 0,
    saldo_actual DECIMAL(18,2) DEFAULT 0,
    color VARCHAR(7),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. PROVEEDORES Y CLIENTES
-- =====================================================

-- Proveedores
CREATE TABLE public.proveedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    rut VARCHAR(20),
    nombre VARCHAR(255) NOT NULL,
    razon_social VARCHAR(255),
    giro VARCHAR(255),
    direccion TEXT,
    ciudad VARCHAR(100),
    region VARCHAR(100),
    telefono VARCHAR(50),
    email VARCHAR(255),
    sitio_web VARCHAR(255),
    contacto_nombre VARCHAR(255),
    contacto_telefono VARCHAR(50),
    contacto_email VARCHAR(255),
    condiciones_pago VARCHAR(100), -- 30 días, 60 días, etc.
    cuenta_bancaria TEXT, -- Info para transferencias
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    rut VARCHAR(20),
    tipo VARCHAR(20) DEFAULT 'empresa' CHECK (tipo IN ('persona', 'empresa')),
    nombre VARCHAR(255) NOT NULL,
    razon_social VARCHAR(255),
    giro VARCHAR(255),
    direccion TEXT,
    ciudad VARCHAR(100),
    region VARCHAR(100),
    telefono VARCHAR(50),
    email VARCHAR(255),
    contacto_nombre VARCHAR(255),
    contacto_telefono VARCHAR(50),
    limite_credito DECIMAL(18,2) DEFAULT 0,
    dias_credito INTEGER DEFAULT 0,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. TRABAJADORES Y NÓMINA
-- =====================================================

-- Departamentos
CREATE TABLE public.departamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    jefe_id UUID, -- Se actualiza después de crear trabajadores
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cargos/Puestos
CREATE TABLE public.cargos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    salario_base DECIMAL(18,2),
    departamento_id UUID REFERENCES public.departamentos(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trabajadores/Empleados
CREATE TABLE public.trabajadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Si tiene acceso al sistema
    rut VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    estado_civil VARCHAR(20),
    nacionalidad VARCHAR(50) DEFAULT 'Chilena',
    direccion TEXT,
    ciudad VARCHAR(100),
    region VARCHAR(100),
    telefono VARCHAR(50),
    email VARCHAR(255),
    telefono_emergencia VARCHAR(50),
    contacto_emergencia VARCHAR(255),
    -- Datos laborales
    departamento_id UUID REFERENCES public.departamentos(id) ON DELETE SET NULL,
    cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL,
    tipo_contrato VARCHAR(50) CHECK (tipo_contrato IN ('indefinido', 'plazo_fijo', 'honorarios', 'practicante', 'temporal')),
    fecha_ingreso DATE NOT NULL,
    fecha_termino DATE,
    jornada VARCHAR(50) DEFAULT 'completa' CHECK (jornada IN ('completa', 'parcial', 'media', 'turnos')),
    horas_semanales INTEGER DEFAULT 45,
    -- Datos de pago
    salario_base DECIMAL(18,2) NOT NULL,
    tipo_pago VARCHAR(20) DEFAULT 'mensual' CHECK (tipo_pago IN ('mensual', 'quincenal', 'semanal', 'diario', 'hora')),
    banco VARCHAR(100),
    tipo_cuenta VARCHAR(50),
    numero_cuenta VARCHAR(50),
    -- AFP y Salud
    afp VARCHAR(100),
    isapre VARCHAR(100),
    plan_isapre DECIMAL(18,2),
    -- Estado
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'vacaciones', 'licencia', 'desvinculado')),
    foto_url TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actualizar referencia de jefe en departamentos
ALTER TABLE public.departamentos 
ADD CONSTRAINT fk_jefe FOREIGN KEY (jefe_id) REFERENCES public.trabajadores(id) ON DELETE SET NULL;

-- Conceptos de nómina (bonos, descuentos, etc.)
CREATE TABLE public.conceptos_nomina (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('haber', 'descuento')),
    es_imponible BOOLEAN DEFAULT true,
    es_tributable BOOLEAN DEFAULT true,
    es_fijo BOOLEAN DEFAULT false, -- Se aplica siempre
    formula TEXT, -- Fórmula de cálculo si aplica
    valor_defecto DECIMAL(18,2),
    porcentaje_defecto DECIMAL(5,2),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liquidaciones de sueldo
CREATE TABLE public.liquidaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    trabajador_id UUID REFERENCES public.trabajadores(id) ON DELETE CASCADE,
    periodo_year INTEGER NOT NULL,
    periodo_month INTEGER NOT NULL CHECK (periodo_month BETWEEN 1 AND 12),
    dias_trabajados INTEGER DEFAULT 30,
    -- Haberes
    sueldo_base DECIMAL(18,2) NOT NULL,
    gratificacion DECIMAL(18,2) DEFAULT 0,
    bono_asistencia DECIMAL(18,2) DEFAULT 0,
    bono_produccion DECIMAL(18,2) DEFAULT 0,
    comisiones DECIMAL(18,2) DEFAULT 0,
    horas_extras DECIMAL(18,2) DEFAULT 0,
    otros_haberes DECIMAL(18,2) DEFAULT 0,
    total_haberes DECIMAL(18,2) NOT NULL,
    -- Descuentos legales
    afp DECIMAL(18,2) DEFAULT 0,
    salud DECIMAL(18,2) DEFAULT 0,
    seguro_cesantia DECIMAL(18,2) DEFAULT 0,
    impuesto_unico DECIMAL(18,2) DEFAULT 0,
    -- Otros descuentos
    anticipos DECIMAL(18,2) DEFAULT 0,
    prestamos DECIMAL(18,2) DEFAULT 0,
    otros_descuentos DECIMAL(18,2) DEFAULT 0,
    total_descuentos DECIMAL(18,2) NOT NULL,
    -- Totales
    sueldo_liquido DECIMAL(18,2) NOT NULL,
    -- Estado
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'aprobada', 'pagada', 'anulada')),
    fecha_pago DATE,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    aprobado_por UUID REFERENCES auth.users(id),
    UNIQUE(trabajador_id, periodo_year, periodo_month)
);

-- Detalle de conceptos en liquidación
CREATE TABLE public.liquidacion_detalles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    liquidacion_id UUID REFERENCES public.liquidaciones(id) ON DELETE CASCADE,
    concepto_id UUID REFERENCES public.conceptos_nomina(id) ON DELETE SET NULL,
    concepto_nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('haber', 'descuento')),
    cantidad DECIMAL(10,2) DEFAULT 1,
    valor_unitario DECIMAL(18,2),
    total DECIMAL(18,2) NOT NULL,
    es_imponible BOOLEAN DEFAULT true,
    es_tributable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vacaciones
CREATE TABLE public.vacaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trabajador_id UUID REFERENCES public.trabajadores(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_habiles INTEGER NOT NULL,
    dias_acumulados_usados DECIMAL(5,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'tomada', 'cancelada')),
    aprobado_por UUID REFERENCES auth.users(id),
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Licencias médicas
CREATE TABLE public.licencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trabajador_id UUID REFERENCES public.trabajadores(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('enfermedad', 'accidente_trabajo', 'maternal', 'paternal', 'otro')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias INTEGER NOT NULL,
    diagnostico TEXT,
    medico VARCHAR(255),
    institucion VARCHAR(255),
    documento_url TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'tramitada', 'aprobada', 'rechazada')),
    subsidio DECIMAL(18,2),
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. TRANSACCIONES FINANCIERAS
-- =====================================================

-- Transacciones (movimientos de dinero)
CREATE TABLE public.transacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    cuenta_id UUID REFERENCES public.cuentas(id) ON DELETE SET NULL,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'gasto', 'transferencia')),
    monto DECIMAL(18,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'CLP',
    tipo_cambio DECIMAL(10,4) DEFAULT 1,
    fecha DATE NOT NULL,
    descripcion TEXT,
    referencia VARCHAR(100), -- Número de documento, factura, etc.
    -- Relaciones opcionales
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    trabajador_id UUID REFERENCES public.trabajadores(id) ON DELETE SET NULL,
    liquidacion_id UUID REFERENCES public.liquidaciones(id) ON DELETE SET NULL,
    -- Para transferencias entre cuentas
    cuenta_destino_id UUID REFERENCES public.cuentas(id) ON DELETE SET NULL,
    -- Documentos
    tipo_documento VARCHAR(50), -- factura, boleta, transferencia, cheque
    numero_documento VARCHAR(50),
    documento_url TEXT,
    -- Estado y auditoría
    estado VARCHAR(20) DEFAULT 'confirmada' CHECK (estado IN ('pendiente', 'confirmada', 'conciliada', 'anulada')),
    conciliada BOOLEAN DEFAULT false,
    fecha_conciliacion DATE,
    recurrente BOOLEAN DEFAULT false,
    recurrencia_id UUID, -- Referencia a transacción recurrente original
    etiquetas TEXT[], -- Array de etiquetas
    notas TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transacciones recurrentes
CREATE TABLE public.transacciones_recurrentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    cuenta_id UUID REFERENCES public.cuentas(id) ON DELETE SET NULL,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
    monto DECIMAL(18,2) NOT NULL,
    descripcion TEXT,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    -- Recurrencia
    frecuencia VARCHAR(20) NOT NULL CHECK (frecuencia IN ('diaria', 'semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual')),
    dia_ejecucion INTEGER, -- Día del mes o día de la semana
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    proxima_ejecucion DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. FACTURAS Y DOCUMENTOS
-- =====================================================

-- Facturas de compra (a proveedores)
CREATE TABLE public.facturas_compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
    numero_factura VARCHAR(50) NOT NULL,
    tipo_documento VARCHAR(50) DEFAULT 'factura' CHECK (tipo_documento IN ('factura', 'factura_exenta', 'boleta', 'nota_credito', 'nota_debito', 'guia_despacho')),
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    fecha_recepcion DATE,
    -- Montos
    subtotal DECIMAL(18,2) NOT NULL,
    descuento DECIMAL(18,2) DEFAULT 0,
    iva DECIMAL(18,2) DEFAULT 0,
    otros_impuestos DECIMAL(18,2) DEFAULT 0,
    total DECIMAL(18,2) NOT NULL,
    -- Estado de pago
    monto_pagado DECIMAL(18,2) DEFAULT 0,
    saldo_pendiente DECIMAL(18,2),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'parcial', 'pagada', 'anulada', 'vencida')),
    -- Documentos
    documento_url TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detalle de facturas de compra
CREATE TABLE public.facturas_compra_detalle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factura_id UUID REFERENCES public.facturas_compra(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
    unidad VARCHAR(20) DEFAULT 'unidad',
    precio_unitario DECIMAL(18,2) NOT NULL,
    descuento DECIMAL(18,2) DEFAULT 0,
    subtotal DECIMAL(18,2) NOT NULL,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    centro_costo_id UUID, -- Para asignar a centro de costo
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pagos a proveedores
CREATE TABLE public.pagos_proveedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
    factura_id UUID REFERENCES public.facturas_compra(id) ON DELETE SET NULL,
    cuenta_id UUID REFERENCES public.cuentas(id) ON DELETE SET NULL,
    transaccion_id UUID REFERENCES public.transacciones(id) ON DELETE SET NULL,
    fecha_pago DATE NOT NULL,
    monto DECIMAL(18,2) NOT NULL,
    metodo_pago VARCHAR(50) CHECK (metodo_pago IN ('transferencia', 'cheque', 'efectivo', 'tarjeta', 'vale_vista', 'otro')),
    numero_operacion VARCHAR(100),
    banco VARCHAR(100),
    documento_url TEXT,
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'completado' CHECK (estado IN ('pendiente', 'completado', 'anulado')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facturas de venta (a clientes)
CREATE TABLE public.facturas_venta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    numero_factura VARCHAR(50) NOT NULL,
    tipo_documento VARCHAR(50) DEFAULT 'factura' CHECK (tipo_documento IN ('factura', 'factura_exenta', 'boleta', 'nota_credito', 'nota_debito', 'cotizacion')),
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    -- Montos
    subtotal DECIMAL(18,2) NOT NULL,
    descuento DECIMAL(18,2) DEFAULT 0,
    iva DECIMAL(18,2) DEFAULT 0,
    total DECIMAL(18,2) NOT NULL,
    -- Estado
    monto_cobrado DECIMAL(18,2) DEFAULT 0,
    saldo_pendiente DECIMAL(18,2),
    estado VARCHAR(20) DEFAULT 'emitida' CHECK (estado IN ('borrador', 'emitida', 'enviada', 'parcial', 'cobrada', 'anulada', 'vencida')),
    enviada_al_sii BOOLEAN DEFAULT false,
    fecha_envio_sii TIMESTAMPTZ,
    -- Documentos
    documento_url TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cobros a clientes
CREATE TABLE public.cobros_clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    factura_id UUID REFERENCES public.facturas_venta(id) ON DELETE SET NULL,
    cuenta_id UUID REFERENCES public.cuentas(id) ON DELETE SET NULL,
    transaccion_id UUID REFERENCES public.transacciones(id) ON DELETE SET NULL,
    fecha_cobro DATE NOT NULL,
    monto DECIMAL(18,2) NOT NULL,
    metodo_pago VARCHAR(50),
    numero_operacion VARCHAR(100),
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'completado',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. CENTROS DE COSTO Y PROYECTOS
-- =====================================================

-- Centros de costo
CREATE TABLE public.centros_costo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    presupuesto_anual DECIMAL(18,2),
    responsable_id UUID REFERENCES public.trabajadores(id) ON DELETE SET NULL,
    padre_id UUID REFERENCES public.centros_costo(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proyectos
CREATE TABLE public.proyectos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    responsable_id UUID REFERENCES public.trabajadores(id) ON DELETE SET NULL,
    centro_costo_id UUID REFERENCES public.centros_costo(id) ON DELETE SET NULL,
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    fecha_fin_real DATE,
    presupuesto DECIMAL(18,2),
    costo_actual DECIMAL(18,2) DEFAULT 0,
    ingreso_actual DECIMAL(18,2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('planificacion', 'activo', 'pausado', 'completado', 'cancelado')),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. PRESUPUESTOS
-- =====================================================

-- Presupuestos
CREATE TABLE public.presupuestos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    año INTEGER NOT NULL,
    mes INTEGER CHECK (mes BETWEEN 1 AND 12), -- NULL para presupuesto anual
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    centro_costo_id UUID REFERENCES public.centros_costo(id) ON DELETE SET NULL,
    monto_presupuestado DECIMAL(18,2) NOT NULL,
    monto_ejecutado DECIMAL(18,2) DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, año, mes, categoria_id, centro_costo_id)
);

-- =====================================================
-- 9. INDICADORES Y MÉTRICAS
-- =====================================================

-- Indicadores financieros calculados (cache)
CREATE TABLE public.indicadores_financieros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- liquidez, rentabilidad, endeudamiento, etc.
    nombre VARCHAR(100) NOT NULL,
    valor DECIMAL(18,4),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, fecha, tipo, nombre)
);

-- =====================================================
-- 10. AUDITORÍA Y LOGS
-- =====================================================

-- Log de actividades
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tabla VARCHAR(100) NOT NULL,
    registro_id UUID,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('crear', 'actualizar', 'eliminar', 'ver')),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices en transacciones
CREATE INDEX idx_transacciones_empresa ON public.transacciones(empresa_id);
CREATE INDEX idx_transacciones_fecha ON public.transacciones(fecha);
CREATE INDEX idx_transacciones_tipo ON public.transacciones(tipo);
CREATE INDEX idx_transacciones_cuenta ON public.transacciones(cuenta_id);
CREATE INDEX idx_transacciones_categoria ON public.transacciones(categoria_id);

-- Índices en trabajadores
CREATE INDEX idx_trabajadores_empresa ON public.trabajadores(empresa_id);
CREATE INDEX idx_trabajadores_departamento ON public.trabajadores(departamento_id);
CREATE INDEX idx_trabajadores_estado ON public.trabajadores(estado);

-- Índices en liquidaciones
CREATE INDEX idx_liquidaciones_trabajador ON public.liquidaciones(trabajador_id);
CREATE INDEX idx_liquidaciones_periodo ON public.liquidaciones(periodo_year, periodo_month);

-- Índices en facturas
CREATE INDEX idx_facturas_compra_proveedor ON public.facturas_compra(proveedor_id);
CREATE INDEX idx_facturas_compra_estado ON public.facturas_compra(estado);
CREATE INDEX idx_facturas_venta_cliente ON public.facturas_venta(cliente_id);
CREATE INDEX idx_facturas_venta_estado ON public.facturas_venta(estado);

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conceptos_nomina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidacion_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones_recurrentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas_compra_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobros_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centros_costo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores_financieros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (usuarios solo ven datos de su empresa)
-- Primero necesitamos una función helper
CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id FROM public.perfiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Política para perfiles (el usuario ve su propio perfil)
CREATE POLICY "Usuarios ven su perfil" ON public.perfiles
    FOR ALL USING (id = auth.uid());

-- Política para empresas
CREATE POLICY "Usuarios ven su empresa" ON public.empresas
    FOR ALL USING (id = public.get_user_empresa_id());

-- Política genérica para tablas con empresa_id
CREATE POLICY "Acceso por empresa" ON public.categorias
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.cuentas
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.proveedores
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.clientes
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.departamentos
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.cargos
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.trabajadores
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.conceptos_nomina
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.liquidaciones
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.transacciones
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.transacciones_recurrentes
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.facturas_compra
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.pagos_proveedores
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.facturas_venta
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.cobros_clientes
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.centros_costo
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.proyectos
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.presupuestos
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.indicadores_financieros
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Acceso por empresa" ON public.audit_log
    FOR ALL USING (empresa_id = public.get_user_empresa_id());

-- Políticas para tablas dependientes (por liquidación)
CREATE POLICY "Acceso por liquidación" ON public.liquidacion_detalles
    FOR ALL USING (
        liquidacion_id IN (
            SELECT id FROM public.liquidaciones WHERE empresa_id = public.get_user_empresa_id()
        )
    );

-- Políticas para vacaciones y licencias
CREATE POLICY "Acceso por trabajador" ON public.vacaciones
    FOR ALL USING (
        trabajador_id IN (
            SELECT id FROM public.trabajadores WHERE empresa_id = public.get_user_empresa_id()
        )
    );

CREATE POLICY "Acceso por trabajador" ON public.licencias
    FOR ALL USING (
        trabajador_id IN (
            SELECT id FROM public.trabajadores WHERE empresa_id = public.get_user_empresa_id()
        )
    );

CREATE POLICY "Acceso por factura" ON public.facturas_compra_detalle
    FOR ALL USING (
        factura_id IN (
            SELECT id FROM public.facturas_compra WHERE empresa_id = public.get_user_empresa_id()
        )
    );

-- =====================================================
-- 13. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.empresas
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.perfiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cuentas
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.proveedores
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.trabajadores
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.liquidaciones
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.transacciones
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.facturas_compra
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.facturas_venta
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.proyectos
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfiles (id, nombre_completo)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'nombre_completo');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 14. DATOS INICIALES (SEED DATA)
-- =====================================================

-- Categorías por defecto (se crearán al crear una empresa)
-- Esto se puede hacer con una función o manualmente

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================
