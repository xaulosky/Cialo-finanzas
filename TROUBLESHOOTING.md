# 🔧 Solución de Problemas - Cialo Finanzas

## 🔴 Errores Comunes y Soluciones

### 1. Error: "Failed to fetch" o "Network error"

**Causa**: La aplicación no puede conectarse a Supabase.

**Soluciones**:
```bash
# ✅ Verifica que la URL de Supabase sea correcta
# En src/js/config.js, debe ser algo como:
# https://xxxxx.supabase.co (sin barra al final)

# ✅ Verifica tu conexión a internet

# ✅ Asegúrate de servir desde HTTP, no desde file://
# Correcto: http://localhost:8000
# Incorrecto: file:///C:/Users/...
```

---

### 2. Error: "Invalid API key"

**Causa**: La clave de API es incorrecta o está mal copiada.

**Soluciones**:
```javascript
// ✅ Verifica que uses la clave "anon public" NO la "service_role"
// En Supabase: Settings > API > anon public

// ✅ No debe tener espacios al inicio o final
// Incorrecto: ' eyJhbG...'
// Correcto: 'eyJhbG...'

// ✅ Debe empezar con "eyJ"
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

### 3. No puedo hacer Login

**Causa**: Usuario no existe o no está confirmado.

**Soluciones**:

1. **Verificar que el usuario existe**:
   - Ve a Supabase > Authentication > Users
   - Busca tu email en la lista

2. **Crear usuario si no existe**:
   - Clic en "Add user" > "Create new user"
   - Email: tu@email.com
   - Password: TuContraseña123
   - ✅ **IMPORTANTE**: Marca "Auto Confirm User"
   - Clic en "Create user"

3. **Verificar que no hay typo en el email**:
   ```javascript
   // Correcto: admin@cialo.com
   // Incorrecto: admin @cialo.com (espacio)
   ```

---

### 4. Error: "No rows returned" o datos no se cargan

**Causa**: Políticas de RLS (Row Level Security) no están configuradas.

**Soluciones**:

1. **Verificar que RLS está habilitado**:
   ```sql
   -- Ejecuta en SQL Editor de Supabase:
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   
   -- Todas las tablas deben tener rowsecurity = true
   ```

2. **Re-crear las políticas**:
   - Ve a SQL Editor
   - Ejecuta nuevamente el archivo `database-setup.sql`

3. **Verificar que estás autenticado**:
   - Cierra sesión y vuelve a iniciar
   - Abre la consola del navegador (F12)
   - Busca errores en rojo

---

### 5. PWA no se instala

**Causa**: Requisitos de PWA no se cumplen.

**Soluciones**:

1. **Debe servirse por HTTPS** (o localhost):
   ```bash
   # ✅ Correcto:
   https://midominio.com
   http://localhost:8000
   
   # ❌ Incorrecto:
   http://192.168.1.100:8000 (usar localhost)
   ```

2. **Verificar manifest.json**:
   - Abre en el navegador: `http://localhost:8000/public/manifest.json`
   - Debe mostrar el contenido JSON
   - Si da error 404, verifica la ruta

3. **Verificar service-worker.js**:
   - Abre: `http://localhost:8000/public/service-worker.js`
   - Debe mostrar el código JavaScript

4. **Verificar iconos**:
   - Los iconos deben existir en `public/img/`
   - Usa `icon-generator.html` para crearlos

5. **Consola del navegador**:
   - Abre DevTools (F12)
   - Ve a "Application" > "Manifest"
   - Verifica que no haya errores

---

### 6. Error: "CORS policy" blocked

**Causa**: Problema de CORS o configuración de Supabase.

**Soluciones**:

1. **No uses file://**:
   ```bash
   # ❌ Incorrecto:
   Abrir index.html directamente con doble clic
   
   # ✅ Correcto:
   python -m http.server 8000
   ```

2. **Verifica la URL de Supabase**:
   - Debe ser exactamente como aparece en Supabase
   - Incluye https://
   - No incluye barra al final

---

### 7. Gráficos no se muestran

**Causa**: Chart.js no se carga o hay error en los datos.

**Soluciones**:

1. **Verificar conexión a CDN**:
   ```html
   <!-- En index.html, debe existir: -->
   <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
   ```

2. **Verificar que hay datos**:
   - El gráfico necesita al menos 1 registro en la base de datos
   - Agrega algunos gastos y ganancias de prueba

3. **Consola del navegador**:
   - F12 > Console
   - Busca errores relacionados con "Chart" o "canvas"

---

### 8. Los estilos no se aplican

**Causa**: Ruta incorrecta del CSS o cache del navegador.

**Soluciones**:

1. **Verificar ruta**:
   ```html
   <!-- En index.html: -->
   <link rel="stylesheet" href="/src/css/styles.css">
   ```

2. **Limpiar cache**:
   - Chrome: Ctrl + Shift + R (forzar recarga)
   - Firefox: Ctrl + F5
   - Safari: Cmd + Shift + R

3. **Verificar que el archivo existe**:
   - Abre: `http://localhost:8000/src/css/styles.css`
   - Debe mostrar el CSS

---

### 9. Error: "supabase is not defined"

**Causa**: Script de Supabase no se carga o orden incorrecto.

**Soluciones**:

1. **Verificar que existe en index.html**:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```

2. **Verificar orden de scripts**:
   ```html
   <!-- ✅ ORDEN CORRECTO: -->
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="/src/js/config.js"></script>
   <script src="/src/js/modules/auth.js"></script>
   <!-- ... otros módulos ... -->
   <script src="/src/js/app.js"></script>
   ```

---

### 10. Datos no se actualizan en tiempo real

**Causa**: Es comportamiento normal, no hay sincronización en tiempo real.

**Soluciones**:

1. **Recargar manualmente**:
   - Cierra y abre la vista
   - O recarga la página (F5)

2. **Implementar actualización automática** (opcional):
   ```javascript
   // Añadir en dashboard.js o donde necesites:
   setInterval(() => {
       DashboardModule.loadDashboard();
   }, 60000); // Actualizar cada minuto
   ```

---

## 🔍 Cómo Depurar

### Consola del Navegador (F12)

1. **Ver errores**:
   - Abre DevTools (F12)
   - Ve a "Console"
   - Busca mensajes en rojo

2. **Ver peticiones de red**:
   - Ve a "Network"
   - Recarga la página
   - Busca peticiones a Supabase (deben estar en verde)

3. **Ver almacenamiento**:
   - Ve a "Application" > "Storage"
   - "Local Storage" debe tener la sesión de Supabase

---

## 📞 Obtener Ayuda

Si ninguna solución funciona:

1. **Revisa los logs**:
   ```javascript
   // Añade esto temporalmente en config.js:
   console.log('Supabase URL:', SUPABASE_URL);
   console.log('Supabase Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
   ```

2. **Verifica Supabase**:
   - Ve a Supabase > Project Settings > API
   - Verifica que el proyecto esté activo (no pausado)

3. **Recrear base de datos**:
   ```sql
   -- En SQL Editor, elimina todo:
   DROP TABLE IF EXISTS ganancias CASCADE;
   DROP TABLE IF EXISTS transacciones_proveedores CASCADE;
   DROP TABLE IF EXISTS proveedores CASCADE;
   DROP TABLE IF EXISTS pagos_sueldos CASCADE;
   DROP TABLE IF EXISTS empleados CASCADE;
   DROP TABLE IF EXISTS gastos_operacionales CASCADE;
   
   -- Luego ejecuta nuevamente database-setup.sql
   ```

---

## ✅ Checklist de Verificación

Antes de pedir ayuda, verifica:

- [ ] Supabase está activo y accesible
- [ ] URL y ANON_KEY están correctamente configurados
- [ ] Usuario existe en Authentication > Users
- [ ] Tablas existen en Table Editor
- [ ] Políticas RLS están activas
- [ ] La app se sirve desde http:// (no file://)
- [ ] Los scripts se cargan en el orden correcto
- [ ] La consola del navegador no muestra errores críticos
- [ ] Conexión a internet funciona correctamente

---

**¿Encontraste un nuevo error?** Documéntalo aquí para futuras referencias.
