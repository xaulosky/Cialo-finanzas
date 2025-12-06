-- =====================================================
-- FIX RLS POLICIES - CIALO FINANZAS
-- Ejecutar para corregir permisos de escritura
-- =====================================================

-- Primero eliminar las políticas existentes y recrearlas correctamente

-- CATEGORIAS
DROP POLICY IF EXISTS "Acceso por empresa" ON public.categorias;

CREATE POLICY "categorias_select" ON public.categorias
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "categorias_insert" ON public.categorias
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "categorias_update" ON public.categorias
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "categorias_delete" ON public.categorias
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- CUENTAS
DROP POLICY IF EXISTS "Acceso por empresa" ON public.cuentas;

CREATE POLICY "cuentas_select" ON public.cuentas
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "cuentas_insert" ON public.cuentas
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "cuentas_update" ON public.cuentas
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "cuentas_delete" ON public.cuentas
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- TRANSACCIONES
DROP POLICY IF EXISTS "Acceso por empresa" ON public.transacciones;

CREATE POLICY "transacciones_select" ON public.transacciones
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "transacciones_insert" ON public.transacciones
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "transacciones_update" ON public.transacciones
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "transacciones_delete" ON public.transacciones
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- PROVEEDORES
DROP POLICY IF EXISTS "Acceso por empresa" ON public.proveedores;

CREATE POLICY "proveedores_select" ON public.proveedores
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "proveedores_insert" ON public.proveedores
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "proveedores_update" ON public.proveedores
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "proveedores_delete" ON public.proveedores
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- CLIENTES
DROP POLICY IF EXISTS "Acceso por empresa" ON public.clientes;

CREATE POLICY "clientes_select" ON public.clientes
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "clientes_insert" ON public.clientes
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "clientes_update" ON public.clientes
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "clientes_delete" ON public.clientes
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- TRABAJADORES
DROP POLICY IF EXISTS "Acceso por empresa" ON public.trabajadores;

CREATE POLICY "trabajadores_select" ON public.trabajadores
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "trabajadores_insert" ON public.trabajadores
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "trabajadores_update" ON public.trabajadores
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "trabajadores_delete" ON public.trabajadores
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- LIQUIDACIONES
DROP POLICY IF EXISTS "Acceso por empresa" ON public.liquidaciones;

CREATE POLICY "liquidaciones_select" ON public.liquidaciones
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "liquidaciones_insert" ON public.liquidaciones
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "liquidaciones_update" ON public.liquidaciones
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "liquidaciones_delete" ON public.liquidaciones
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- FACTURAS COMPRA
DROP POLICY IF EXISTS "Acceso por empresa" ON public.facturas_compra;

CREATE POLICY "facturas_compra_select" ON public.facturas_compra
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "facturas_compra_insert" ON public.facturas_compra
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "facturas_compra_update" ON public.facturas_compra
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "facturas_compra_delete" ON public.facturas_compra
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- FACTURAS VENTA
DROP POLICY IF EXISTS "Acceso por empresa" ON public.facturas_venta;

CREATE POLICY "facturas_venta_select" ON public.facturas_venta
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "facturas_venta_insert" ON public.facturas_venta
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "facturas_venta_update" ON public.facturas_venta
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "facturas_venta_delete" ON public.facturas_venta
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- DEPARTAMENTOS
DROP POLICY IF EXISTS "Acceso por empresa" ON public.departamentos;

CREATE POLICY "departamentos_select" ON public.departamentos
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "departamentos_insert" ON public.departamentos
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "departamentos_update" ON public.departamentos
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

-- CARGOS
DROP POLICY IF EXISTS "Acceso por empresa" ON public.cargos;

CREATE POLICY "cargos_select" ON public.cargos
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "cargos_insert" ON public.cargos
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "cargos_update" ON public.cargos
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

-- CONCEPTOS NOMINA
DROP POLICY IF EXISTS "Acceso por empresa" ON public.conceptos_nomina;

CREATE POLICY "conceptos_nomina_select" ON public.conceptos_nomina
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "conceptos_nomina_insert" ON public.conceptos_nomina
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "conceptos_nomina_update" ON public.conceptos_nomina
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

-- TRANSACCIONES RECURRENTES
DROP POLICY IF EXISTS "Acceso por empresa" ON public.transacciones_recurrentes;

CREATE POLICY "transacciones_recurrentes_select" ON public.transacciones_recurrentes
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "transacciones_recurrentes_insert" ON public.transacciones_recurrentes
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "transacciones_recurrentes_update" ON public.transacciones_recurrentes
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

-- PAGOS PROVEEDORES
DROP POLICY IF EXISTS "Acceso por empresa" ON public.pagos_proveedores;

CREATE POLICY "pagos_proveedores_select" ON public.pagos_proveedores
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "pagos_proveedores_insert" ON public.pagos_proveedores
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

-- COBROS CLIENTES
DROP POLICY IF EXISTS "Acceso por empresa" ON public.cobros_clientes;

CREATE POLICY "cobros_clientes_select" ON public.cobros_clientes
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "cobros_clientes_insert" ON public.cobros_clientes
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

-- CENTROS DE COSTO
DROP POLICY IF EXISTS "Acceso por empresa" ON public.centros_costo;

CREATE POLICY "centros_costo_select" ON public.centros_costo
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "centros_costo_insert" ON public.centros_costo
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "centros_costo_update" ON public.centros_costo
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

-- PROYECTOS
DROP POLICY IF EXISTS "Acceso por empresa" ON public.proyectos;

CREATE POLICY "proyectos_select" ON public.proyectos
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "proyectos_insert" ON public.proyectos
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "proyectos_update" ON public.proyectos
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

-- PRESUPUESTOS
DROP POLICY IF EXISTS "Acceso por empresa" ON public.presupuestos;

CREATE POLICY "presupuestos_select" ON public.presupuestos
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "presupuestos_insert" ON public.presupuestos
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "presupuestos_update" ON public.presupuestos
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

-- =====================================================
-- VERIFICACIÓN - Ejecuta para confirmar
-- =====================================================
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public';
