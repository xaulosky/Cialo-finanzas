-- =====================================================
-- DATOS INICIALES - CIALO FINANZAS
-- Ejecutar después del schema.sql
-- =====================================================

-- 1. Crear empresa inicial
INSERT INTO public.empresas (id, nombre, rut, giro, moneda_principal)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Mi Empresa',
    '76.123.456-7',
    'Servicios Financieros',
    'CLP'
);

-- 2. Actualizar tu perfil para asociarlo a la empresa
-- (Reemplaza con tu user_id real de Supabase Auth, o ejecuta después de registrarte)
UPDATE public.perfiles 
SET empresa_id = '00000000-0000-0000-0000-000000000001',
    nombre_completo = 'Administrador',
    rol = 'admin'
WHERE id = (SELECT id FROM auth.users LIMIT 1);

-- Si el perfil no existe, crearlo manualmente
INSERT INTO public.perfiles (id, empresa_id, nombre_completo, rol)
SELECT 
    u.id,
    '00000000-0000-0000-0000-000000000001',
    'Administrador',
    'admin'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = u.id)
LIMIT 1;

-- 3. Categorías de gastos por defecto
INSERT INTO public.categorias (empresa_id, nombre, tipo, color, descripcion) VALUES
('00000000-0000-0000-0000-000000000001', 'Sueldos y Salarios', 'gasto', '#ef4444', 'Remuneraciones del personal'),
('00000000-0000-0000-0000-000000000001', 'Arriendos', 'gasto', '#f97316', 'Arriendo de oficinas y locales'),
('00000000-0000-0000-0000-000000000001', 'Servicios Básicos', 'gasto', '#eab308', 'Luz, agua, gas, internet'),
('00000000-0000-0000-0000-000000000001', 'Transporte', 'gasto', '#84cc16', 'Combustible, pasajes, fletes'),
('00000000-0000-0000-0000-000000000001', 'Alimentación', 'gasto', '#22c55e', 'Comidas, colaciones'),
('00000000-0000-0000-0000-000000000001', 'Insumos', 'gasto', '#14b8a6', 'Materiales y suministros'),
('00000000-0000-0000-0000-000000000001', 'Marketing', 'gasto', '#06b6d4', 'Publicidad y promoción'),
('00000000-0000-0000-0000-000000000001', 'Software', 'gasto', '#3b82f6', 'Licencias y suscripciones'),
('00000000-0000-0000-0000-000000000001', 'Impuestos', 'gasto', '#8b5cf6', 'IVA, PPM, patentes'),
('00000000-0000-0000-0000-000000000001', 'Otros Gastos', 'gasto', '#64748b', 'Gastos varios');

-- 4. Categorías de ingresos por defecto
INSERT INTO public.categorias (empresa_id, nombre, tipo, color, descripcion) VALUES
('00000000-0000-0000-0000-000000000001', 'Ventas', 'ingreso', '#22c55e', 'Ventas de productos/servicios'),
('00000000-0000-0000-0000-000000000001', 'Servicios', 'ingreso', '#10b981', 'Prestación de servicios'),
('00000000-0000-0000-0000-000000000001', 'Honorarios', 'ingreso', '#14b8a6', 'Honorarios profesionales'),
('00000000-0000-0000-0000-000000000001', 'Comisiones', 'ingreso', '#06b6d4', 'Comisiones por ventas'),
('00000000-0000-0000-0000-000000000001', 'Intereses', 'ingreso', '#3b82f6', 'Intereses bancarios'),
('00000000-0000-0000-0000-000000000001', 'Otros Ingresos', 'ingreso', '#6366f1', 'Ingresos varios');

-- 5. Cuentas bancarias de ejemplo
INSERT INTO public.cuentas (empresa_id, nombre, tipo, banco, saldo_inicial, saldo_actual, moneda) VALUES
('00000000-0000-0000-0000-000000000001', 'Cuenta Corriente', 'banco', 'Banco Estado', 0, 0, 'CLP'),
('00000000-0000-0000-0000-000000000001', 'Caja Chica', 'efectivo', NULL, 0, 0, 'CLP');

-- 6. Conceptos de nómina básicos
INSERT INTO public.conceptos_nomina (empresa_id, codigo, nombre, tipo, es_imponible, es_tributable) VALUES
('00000000-0000-0000-0000-000000000001', 'SB', 'Sueldo Base', 'haber', true, true),
('00000000-0000-0000-0000-000000000001', 'GRAT', 'Gratificación', 'haber', true, true),
('00000000-0000-0000-0000-000000000001', 'BONO', 'Bono', 'haber', true, true),
('00000000-0000-0000-0000-000000000001', 'COLAC', 'Colación', 'haber', false, false),
('00000000-0000-0000-0000-000000000001', 'MOVIL', 'Movilización', 'haber', false, false),
('00000000-0000-0000-0000-000000000001', 'AFP', 'AFP', 'descuento', false, false),
('00000000-0000-0000-0000-000000000001', 'SALUD', 'Isapre/Fonasa', 'descuento', false, false),
('00000000-0000-0000-0000-000000000001', 'CESANT', 'Seguro Cesantía', 'descuento', false, false);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ejecuta estas consultas para verificar:
-- SELECT * FROM public.empresas;
-- SELECT * FROM public.perfiles;
-- SELECT * FROM public.categorias;
-- SELECT * FROM public.cuentas;
