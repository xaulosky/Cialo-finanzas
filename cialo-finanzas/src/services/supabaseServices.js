import { supabase } from '../lib/supabase'

// =====================================================
// HELPER: Obtener empresa_id del usuario actual
// =====================================================

let cachedEmpresaId = null

export const getEmpresaId = async () => {
    if (cachedEmpresaId) return cachedEmpresaId

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: perfil } = await supabase
        .from('perfiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    cachedEmpresaId = perfil?.empresa_id
    return cachedEmpresaId
}

// Limpiar cache al cambiar sesión
supabase.auth.onAuthStateChange(() => {
    cachedEmpresaId = null
})

// =====================================================
// SERVICIO DE EMPRESAS
// =====================================================

export const empresaService = {
    async getEmpresa() {
        const empresaId = await getEmpresaId()
        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', empresaId)
            .single()
        return { data, error }
    },

    async createEmpresa(empresa) {
        const { data, error } = await supabase
            .from('empresas')
            .insert(empresa)
            .select()
            .single()
        return { data, error }
    },

    async updateEmpresa(id, updates) {
        const { data, error } = await supabase
            .from('empresas')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    }
}

// =====================================================
// SERVICIO DE PERFILES
// =====================================================

export const perfilService = {
    async getPerfil() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: 'No user' }

        const { data, error } = await supabase
            .from('perfiles')
            .select('*, empresa:empresas(*)')
            .eq('id', user.id)
            .single()
        return { data, error }
    },

    async updatePerfil(updates) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: 'No user' }

        const { data, error } = await supabase
            .from('perfiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()
        return { data, error }
    }
}

// =====================================================
// SERVICIO DE CUENTAS
// =====================================================

export const cuentaService = {
    async getCuentas() {
        const { data, error } = await supabase
            .from('cuentas')
            .select('*')
            .eq('activo', true)
            .order('nombre')
        return { data: data || [], error }
    },

    async getCuenta(id) {
        const { data, error } = await supabase
            .from('cuentas')
            .select('*')
            .eq('id', id)
            .single()
        return { data, error }
    },

    async createCuenta(cuenta) {
        const empresaId = await getEmpresaId()
        const { data, error } = await supabase
            .from('cuentas')
            .insert({ ...cuenta, empresa_id: empresaId })
            .select()
            .single()
        return { data, error }
    },

    async updateCuenta(id, updates) {
        const { data, error } = await supabase
            .from('cuentas')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    },

    async deleteCuenta(id) {
        const { error } = await supabase
            .from('cuentas')
            .update({ activo: false })
            .eq('id', id)
        return { error }
    }
}

// =====================================================
// SERVICIO DE CATEGORÍAS
// =====================================================

export const categoriaService = {
    async getCategorias(tipo = null) {
        let query = supabase
            .from('categorias')
            .select('*')
            .eq('activo', true)
            .order('nombre')

        if (tipo) {
            query = query.eq('tipo', tipo)
        }

        const { data, error } = await query
        return { data: data || [], error }
    },

    async createCategoria(categoria) {
        const empresaId = await getEmpresaId()
        const { data, error } = await supabase
            .from('categorias')
            .insert({ ...categoria, empresa_id: empresaId })
            .select()
            .single()
        return { data, error }
    },

    async updateCategoria(id, updates) {
        const { data, error } = await supabase
            .from('categorias')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    },

    async deleteCategoria(id) {
        const { error } = await supabase
            .from('categorias')
            .update({ activo: false })
            .eq('id', id)
        return { error }
    }
}

// =====================================================
// SERVICIO DE TRANSACCIONES
// =====================================================

export const transaccionService = {
    async getTransacciones(filters = {}) {
        let query = supabase
            .from('transacciones')
            .select(`
                *,
                cuenta:cuentas!transacciones_cuenta_id_fkey(id, nombre, tipo),
                categoria:categorias(id, nombre, tipo, color),
                proveedor:proveedores(id, nombre),
                cliente:clientes(id, nombre)
            `)
            .order('fecha', { ascending: false })
            .order('created_at', { ascending: false })

        if (filters.tipo) query = query.eq('tipo', filters.tipo)
        if (filters.cuenta_id) query = query.eq('cuenta_id', filters.cuenta_id)
        if (filters.categoria_id) query = query.eq('categoria_id', filters.categoria_id)
        if (filters.fecha_inicio) query = query.gte('fecha', filters.fecha_inicio)
        if (filters.fecha_fin) query = query.lte('fecha', filters.fecha_fin)
        if (filters.limit) query = query.limit(filters.limit)

        const { data, error } = await query
        return { data: data || [], error }
    },

    async getTransaccion(id) {
        const { data, error } = await supabase
            .from('transacciones')
            .select(`
                *,
                cuenta:cuentas!transacciones_cuenta_id_fkey(*),
                categoria:categorias(*),
                proveedor:proveedores(*),
                cliente:clientes(*)
            `)
            .eq('id', id)
            .single()
        return { data, error }
    },

    async createTransaccion(transaccion) {
        const empresaId = await getEmpresaId()
        const { data, error } = await supabase
            .from('transacciones')
            .insert({ ...transaccion, empresa_id: empresaId })
            .select()
            .single()

        // Actualizar saldo de cuenta
        if (data && !error) {
            await updateSaldoCuenta(transaccion.cuenta_id, transaccion.tipo, transaccion.monto)
        }

        return { data, error }
    },

    async updateTransaccion(id, updates) {
        const { data, error } = await supabase
            .from('transacciones')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    },

    async deleteTransaccion(id) {
        const { error } = await supabase
            .from('transacciones')
            .update({ estado: 'anulada' })
            .eq('id', id)
        return { error }
    },

    async getResumen(fechaInicio, fechaFin) {
        const { data, error } = await supabase
            .from('transacciones')
            .select('tipo, monto')
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin)
            .neq('estado', 'anulada')

        if (error) return { data: null, error }

        const resumen = {
            ingresos: 0,
            gastos: 0,
            balance: 0
        }

        data.forEach(t => {
            if (t.tipo === 'ingreso') resumen.ingresos += Number(t.monto)
            if (t.tipo === 'gasto') resumen.gastos += Number(t.monto)
        })

        resumen.balance = resumen.ingresos - resumen.gastos

        return { data: resumen, error: null }
    }
}

async function updateSaldoCuenta(cuentaId, tipo, monto) {
    const { data: cuenta } = await supabase
        .from('cuentas')
        .select('saldo_actual')
        .eq('id', cuentaId)
        .single()

    if (cuenta) {
        const nuevoSaldo = tipo === 'ingreso'
            ? Number(cuenta.saldo_actual) + Number(monto)
            : Number(cuenta.saldo_actual) - Number(monto)

        await supabase
            .from('cuentas')
            .update({ saldo_actual: nuevoSaldo })
            .eq('id', cuentaId)
    }
}

// =====================================================
// SERVICIO DE PROVEEDORES
// =====================================================

export const proveedorService = {
    async getProveedores() {
        const { data, error } = await supabase
            .from('proveedores')
            .select('*')
            .eq('activo', true)
            .order('nombre')
        return { data: data || [], error }
    },

    async getProveedor(id) {
        const { data, error } = await supabase
            .from('proveedores')
            .select('*')
            .eq('id', id)
            .single()
        return { data, error }
    },

    async createProveedor(proveedor) {
        const empresaId = await getEmpresaId()
        const { data, error } = await supabase
            .from('proveedores')
            .insert({ ...proveedor, empresa_id: empresaId })
            .select()
            .single()
        return { data, error }
    },

    async updateProveedor(id, updates) {
        const { data, error } = await supabase
            .from('proveedores')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    },

    async deleteProveedor(id) {
        const { error } = await supabase
            .from('proveedores')
            .update({ activo: false })
            .eq('id', id)
        return { error }
    }
}

// =====================================================
// SERVICIO DE CLIENTES
// =====================================================

export const clienteService = {
    async getClientes() {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('activo', true)
            .order('nombre')
        return { data: data || [], error }
    },

    async getCliente(id) {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single()
        return { data, error }
    },

    async createCliente(cliente) {
        const empresaId = await getEmpresaId()
        const { data, error } = await supabase
            .from('clientes')
            .insert({ ...cliente, empresa_id: empresaId })
            .select()
            .single()
        return { data, error }
    },

    async updateCliente(id, updates) {
        const { data, error } = await supabase
            .from('clientes')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    },

    async deleteCliente(id) {
        const { error } = await supabase
            .from('clientes')
            .update({ activo: false })
            .eq('id', id)
        return { error }
    }
}

// =====================================================
// SERVICIO DE TRABAJADORES
// =====================================================

export const trabajadorService = {
    async getTrabajadores() {
        const { data, error } = await supabase
            .from('trabajadores')
            .select(`
        *,
        departamento:departamentos(id, nombre),
        cargo:cargos(id, nombre)
      `)
            .neq('estado', 'desvinculado')
            .order('apellido_paterno')
        return { data: data || [], error }
    },

    async getTrabajador(id) {
        const { data, error } = await supabase
            .from('trabajadores')
            .select(`
        *,
        departamento:departamentos(*),
        cargo:cargos(*)
      `)
            .eq('id', id)
            .single()
        return { data, error }
    },

    async createTrabajador(trabajador) {
        const empresaId = await getEmpresaId()
        const { data, error } = await supabase
            .from('trabajadores')
            .insert({ ...trabajador, empresa_id: empresaId })
            .select()
            .single()
        return { data, error }
    },

    async updateTrabajador(id, updates) {
        const { data, error } = await supabase
            .from('trabajadores')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    },

    async deleteTrabajador(id) {
        const { error } = await supabase
            .from('trabajadores')
            .update({ estado: 'desvinculado' })
            .eq('id', id)
        return { error }
    }
}

// =====================================================
// SERVICIO DE LIQUIDACIONES
// =====================================================

export const liquidacionService = {
    async getLiquidaciones(filters = {}) {
        let query = supabase
            .from('liquidaciones')
            .select(`
        *,
        trabajador:trabajadores(id, nombre, apellido_paterno, apellido_materno, rut)
      `)
            .order('periodo_year', { ascending: false })
            .order('periodo_month', { ascending: false })

        if (filters.trabajador_id) query = query.eq('trabajador_id', filters.trabajador_id)
        if (filters.periodo_year) query = query.eq('periodo_year', filters.periodo_year)
        if (filters.periodo_month) query = query.eq('periodo_month', filters.periodo_month)
        if (filters.estado) query = query.eq('estado', filters.estado)

        const { data, error } = await query
        return { data: data || [], error }
    },

    async getLiquidacion(id) {
        const { data, error } = await supabase
            .from('liquidaciones')
            .select(`
        *,
        trabajador:trabajadores(*),
        detalles:liquidacion_detalles(*)
      `)
            .eq('id', id)
            .single()
        return { data, error }
    },

    async createLiquidacion(liquidacion) {
        const empresaId = await getEmpresaId()
        const { data, error } = await supabase
            .from('liquidaciones')
            .insert({ ...liquidacion, empresa_id: empresaId })
            .select()
            .single()
        return { data, error }
    },

    async updateLiquidacion(id, updates) {
        const { data, error } = await supabase
            .from('liquidaciones')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    }
}

// =====================================================
// SERVICIO DE FACTURAS
// =====================================================

export const facturaCompraService = {
    async getFacturas(filters = {}) {
        let query = supabase
            .from('facturas_compra')
            .select(`
        *,
        proveedor:proveedores(id, nombre, rut)
      `)
            .order('fecha_emision', { ascending: false })

        if (filters.proveedor_id) query = query.eq('proveedor_id', filters.proveedor_id)
        if (filters.estado) query = query.eq('estado', filters.estado)

        const { data, error } = await query
        return { data: data || [], error }
    },

    async createFactura(factura) {
        const empresaId = await getEmpresaId()
        const { data, error } = await supabase
            .from('facturas_compra')
            .insert({
                ...factura,
                empresa_id: empresaId,
                saldo_pendiente: factura.total
            })
            .select()
            .single()
        return { data, error }
    },

    async updateFactura(id, updates) {
        const { data, error } = await supabase
            .from('facturas_compra')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        return { data, error }
    }
}

export const facturaVentaService = {
    async getFacturas(filters = {}) {
        let query = supabase
            .from('facturas_venta')
            .select(`
        *,
        cliente:clientes(id, nombre, rut)
      `)
            .order('fecha_emision', { ascending: false })

        if (filters.cliente_id) query = query.eq('cliente_id', filters.cliente_id)
        if (filters.estado) query = query.eq('estado', filters.estado)

        const { data, error } = await query
        return { data: data || [], error }
    },

    async createFactura(factura) {
        const empresaId = await getEmpresaId()
        const { data, error } = await supabase
            .from('facturas_venta')
            .insert({
                ...factura,
                empresa_id: empresaId,
                saldo_pendiente: factura.total
            })
            .select()
            .single()
        return { data, error }
    }
}
