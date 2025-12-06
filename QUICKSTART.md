# 🚀 Inicio Rápido - Cialo Finanzas

## ⚡ 3 Pasos para Empezar

### 1️⃣ Configurar Supabase (5 minutos)

```bash
# 1. Crea cuenta en supabase.com
# 2. Crea un nuevo proyecto
# 3. Ve a SQL Editor y ejecuta: database-setup.sql
# 4. Copia tu URL y ANON KEY desde Project Settings > API
```

### 2️⃣ Configurar la App (1 minuto)

Edita `src/js/config.js`:

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key-aqui';
```

### 3️⃣ Ejecutar (30 segundos)

```bash
# Con Python
python -m http.server 8000

# O con Node.js
npx http-server -p 8000
```

Abre: **http://localhost:8000**

## 🔐 Crear Usuario

1. Ve a Supabase > Authentication > Users
2. Clic en "Add user" > "Create new user"
3. Ingresa email y contraseña
4. Marca "Auto Confirm User"
5. ¡Listo! Úsalo para hacer login

## 📚 Documentación Completa

- **README.md**: Documentación general
- **SUPABASE_SETUP.md**: Guía detallada de Supabase paso a paso
- **database-setup.sql**: Script SQL para crear las tablas

## 🎯 Próximos Pasos

1. ✅ Crear tu primer empleado
2. ✅ Registrar un gasto
3. ✅ Agregar una ganancia
4. ✅ Ver el dashboard actualizado

## 📱 Instalar como PWA

Una vez abierta en el navegador:
- Chrome/Edge: Clic en ⊕ en la barra de direcciones
- iOS: Compartir > "Agregar a pantalla de inicio"
- Android: Menú > "Instalar aplicación"

## ❓ Ayuda

¿Problemas? Revisa:
- **SUPABASE_SETUP.md** para configuración detallada
- **README.md** para solución de problemas
- Consola del navegador (F12) para ver errores

---

¡Todo listo! Tu sistema financiero está operativo en menos de 10 minutos. 🎉
