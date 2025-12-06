# 🏥 Cialo Finanzas - Sistema de Gestión Financiera

PWA completa para la gestión financiera de la Clínica Cialo. Desarrollada con JavaScript vanilla y Supabase.

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[📖 INDEX.md](INDEX.md)** | Índice completo de toda la documentación |
| **[⚡ QUICKSTART.md](QUICKSTART.md)** | Inicio rápido en 3 pasos (10 minutos) |
| **[🗄️ SUPABASE_SETUP.md](SUPABASE_SETUP.md)** | Guía paso a paso de configuración Supabase |
| **[🔧 TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Solución de problemas comunes |
| **[💡 EXAMPLES.md](EXAMPLES.md)** | Ejemplos de uso y casos prácticos |
| **[🚀 DEPLOYMENT.md](DEPLOYMENT.md)** | Guía de despliegue a producción |
| **[📊 PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Resumen completo del proyecto |

---

## 🎯 Características

### Módulos Principales
- **Dashboard**: Resumen financiero con estadísticas y gráficos de los últimos 6 meses
- **Gastos Operacionales**: Gestión de luz, agua, alquiler, materiales médicos, etc.
- **Gestión de Sueldos**: Registro de empleados y control de pagos de nómina
- **Proveedores**: Administración de proveedores y sus transacciones
- **Ganancias**: Registro de ingresos por servicios médicos

### Funcionalidades
✅ Autenticación segura con Supabase Auth  
✅ CRUD completo para todas las entidades  
✅ Filtros por categoría y período  
✅ Gráficos interactivos con Chart.js  
✅ Diseño responsive (móvil, tablet, desktop)  
✅ PWA instalable (funciona offline)  
✅ Notificaciones toast  
✅ Exportable para impresión  

## 🚀 Instalación y Configuración

### 1. Requisitos Previos
- Cuenta en [Supabase](https://supabase.com)
- Servidor web (puede ser local con Python, Node.js, etc.)

### 2. Configurar Supabase

#### A. Crear el proyecto
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la URL del proyecto y la clave ANON

#### B. Crear las tablas
Ejecuta el script SQL en el "SQL Editor" de Supabase (ver archivo `database-setup.sql`).

#### C. Configurar autenticación
1. Ve a Authentication > Providers
2. Habilita "Email" como método de autenticación

#### D. Crear usuario inicial
1. Ve a Authentication > Users
2. Haz clic en "Add User"
3. Ingresa email y contraseña para el primer usuario

### 3. Configurar la Aplicación

Edita el archivo `src/js/config.js` con tus credenciales de Supabase.

### 4. Ejecutar la Aplicación

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx http-server -p 8000
```

Luego abre: `http://localhost:8000`

## 📁 Estructura del Proyecto

```
Cialo-finanzas/
├── index.html                  # Página principal
├── README.md                   # Este archivo
├── database-setup.sql          # Script SQL para Supabase
├── public/
│   ├── manifest.json          # Configuración PWA
│   ├── service-worker.js      # Service Worker
│   └── img/                   # Iconos PWA
└── src/
    ├── css/
    │   └── styles.css         # Estilos completos
    └── js/
        ├── config.js          # Configuración Supabase
        ├── app.js             # App principal
        └── modules/           # Módulos funcionales
```

## 💾 Base de Datos

### Tablas Principales
1. **gastos_operacionales**: Registro de gastos
2. **empleados**: Información de empleados
3. **pagos_sueldos**: Registro de nómina
4. **proveedores**: Catálogo de proveedores
5. **transacciones_proveedores**: Compras y pagos
6. **ganancias**: Registro de ingresos

Consulta `database-setup.sql` para el script completo.

## 📱 Uso

### Login
Ingresa con el email y contraseña creados en Supabase.

### Dashboard
Visualiza estadísticas del mes actual y gráfico de los últimos 6 meses.

### Módulos
- **Gastos**: Registra gastos operacionales por categoría
- **Sueldos**: Gestiona empleados y sus pagos
- **Proveedores**: Administra proveedores y transacciones
- **Ganancias**: Registra ingresos por servicios

## 🔧 Personalización

Modifica moneda, colores y configuraciones en:
- `src/js/config.js` - Configuración general
- `src/css/styles.css` - Variables CSS

## 🚀 Despliegue

Opciones recomendadas:
- **Vercel** / **Netlify**: Gratis desde GitHub
- **GitHub Pages**: Para repositorios públicos
- **Firebase Hosting**: Con límites gratuitos

---

Desarrollado con ❤️ para Clínica Cialo