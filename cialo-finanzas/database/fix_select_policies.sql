-- =====================================================
-- FIX SELECT POLICIES - CIALO FINANZAS
-- Ejecutar si las transacciones no se muestran
-- =====================================================

-- Verificar qué políticas existen
-- SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transacciones';

-- Eliminar políticas existentes de transacciones y recrearlas
DROP POLICY IF EXISTS "transacciones_select" ON public.transacciones;
DROP POLICY IF EXISTS "transacciones_insert" ON public.transacciones;
DROP POLICY IF EXISTS "transacciones_update" ON public.transacciones;
DROP POLICY IF EXISTS "transacciones_delete" ON public.transacciones;
DROP POLICY IF EXISTS "Acceso por empresa" ON public.transacciones;

-- Recrear con USING correcto
CREATE POLICY "transacciones_select" ON public.transacciones
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "transacciones_insert" ON public.transacciones
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "transacciones_update" ON public.transacciones
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "transacciones_delete" ON public.transacciones
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- VERIFICAR que la función get_user_empresa_id funciona:
-- SELECT public.get_user_empresa_id();
-- Debería retornar: 00000000-0000-0000-0000-000000000001

-- Si retorna NULL, significa que tu perfil no tiene empresa_id asignado
-- Para arreglarlo, ejecuta:
-- UPDATE public.perfiles 
-- SET empresa_id = '00000000-0000-0000-0000-000000000001' 
-- WHERE id = auth.uid();

-- Verificar las transacciones directamente (bypass RLS para admin):
-- SELECT id, tipo, monto, fecha, empresa_id FROM public.transacciones;
