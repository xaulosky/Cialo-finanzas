// Formatear moneda chilena
export const formatCurrency = (amount, currency = 'CLP') => {
    const num = Number(amount) || 0
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency,
        minimumFractionDigits: currency === 'CLP' ? 0 : 2,
    }).format(num)
}

// Formatear fecha
export const formatDate = (date, options = {}) => {
    if (!date) return '-'
    const d = new Date(date)
    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options
    }).format(d)
}

// Formatear fecha con hora
export const formatDateTime = (date) => {
    if (!date) return '-'
    const d = new Date(date)
    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(d)
}

// Formatear RUT chileno
export const formatRut = (rut) => {
    if (!rut) return ''
    const clean = rut.replace(/[^0-9kK]/g, '')
    if (clean.length < 2) return clean

    const body = clean.slice(0, -1)
    const dv = clean.slice(-1).toUpperCase()

    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${formatted}-${dv}`
}

// Validar RUT chileno
export const validateRut = (rut) => {
    if (!rut) return false
    const clean = rut.replace(/[^0-9kK]/g, '')
    if (clean.length < 2) return false

    const body = clean.slice(0, -1)
    const dv = clean.slice(-1).toUpperCase()

    let sum = 0
    let mul = 2

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * mul
        mul = mul === 7 ? 2 : mul + 1
    }

    const mod = 11 - (sum % 11)
    const expected = mod === 11 ? '0' : mod === 10 ? 'K' : String(mod)

    return dv === expected
}

// Obtener nombre del mes
export const getMonthName = (month) => {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[month - 1] || ''
}

// Calcular porcentaje
export const calculatePercentage = (value, total) => {
    if (!total) return 0
    return Math.round((value / total) * 100)
}

// Truncar texto
export const truncateText = (text, maxLength = 50) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

// Generar color aleatorio basado en string
export const stringToColor = (str) => {
    if (!str) return '#6366f1'
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360
    return `hsl(${hue}, 65%, 55%)`
}

// Debounce function
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Obtener iniciales
export const getInitials = (name) => {
    if (!name) return '?'
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
}

// Fecha inicio del mes actual
export const getStartOfMonth = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}

// Fecha fin del mes actual
export const getEndOfMonth = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
}

// Fecha de hoy
export const getToday = () => {
    return new Date().toISOString().split('T')[0]
}
