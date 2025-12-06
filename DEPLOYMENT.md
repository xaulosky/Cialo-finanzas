# 🚀 Guía de Despliegue a Producción

Esta guía te ayudará a poner tu aplicación en línea y accesible desde cualquier lugar.

---

## 🌐 Opciones de Hosting

### Opción 1: Netlify (Recomendado - Más Fácil) ⭐

**Ventajas**: Gratis, rápido, SSL automático, despliegue en 5 minutos

#### Paso a Paso:

1. **Crear cuenta en Netlify**
   ```
   Ve a: https://www.netlify.com/
   Clic en "Sign up" (puedes usar GitHub, GitLab o email)
   ```

2. **Método A: Drag & Drop (Sin Git)**
   ```
   1. Comprime tu carpeta del proyecto en un .zip
      (excluye node_modules y .git)
   2. Ve a https://app.netlify.com/drop
   3. Arrastra el .zip a la página
   4. ¡Listo! Tu app estará en https://nombre-random.netlify.app
   ```

3. **Método B: Desde GitHub (Recomendado)**
   ```
   1. Sube tu proyecto a GitHub
   2. En Netlify: "New site from Git"
   3. Conecta tu repositorio
   4. Build settings:
      - Build command: (dejar vacío)
      - Publish directory: .
   5. Deploy site
   ```

4. **Configurar dominio personalizado** (Opcional)
   ```
   1. En tu sitio Netlify: Domain settings
   2. Add custom domain
   3. Ingresa: finanzas.cialo.com
   4. Sigue las instrucciones para configurar DNS
   ```

---

### Opción 2: Vercel (Muy Rápido)

**Ventajas**: Similar a Netlify, excelente rendimiento

#### Paso a Paso:

1. **Crear cuenta**
   ```
   Ve a: https://vercel.com/
   Sign up con GitHub (recomendado)
   ```

2. **Desplegar**
   ```
   1. Sube tu código a GitHub
   2. En Vercel: "New Project"
   3. Import repository
   4. Deploy
   
   URL: https://tu-proyecto.vercel.app
   ```

---

### Opción 3: GitHub Pages (Gratis)

**Ventajas**: Totalmente gratis, integrado con GitHub

#### Paso a Paso:

1. **Preparar repositorio**
   ```bash
   # Inicializar git si no lo has hecho
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Subir a GitHub**
   ```bash
   # Crear repo en GitHub primero
   git remote add origin https://github.com/tu-usuario/cialo-finanzas.git
   git branch -M main
   git push -u origin main
   ```

3. **Activar GitHub Pages**
   ```
   1. Ve a Settings de tu repositorio
   2. Pages (menú lateral)
   3. Source: Deploy from a branch
   4. Branch: main / (root)
   5. Save
   
   URL: https://tu-usuario.github.io/cialo-finanzas/
   ```

4. **Actualizar rutas (si es necesario)**
   ```html
   <!-- En index.html, cambiar rutas absolutas por relativas: -->
   <!-- De: /src/css/styles.css -->
   <!-- A:  ./src/css/styles.css -->
   ```

---

### Opción 4: Firebase Hosting

**Ventajas**: De Google, muy confiable, CDN global

#### Paso a Paso:

1. **Instalar Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Inicializar proyecto**
   ```bash
   firebase login
   firebase init hosting
   
   # Responde:
   # Public directory: .
   # Single-page app: No
   # Setup automatic builds: No
   ```

3. **Desplegar**
   ```bash
   firebase deploy
   
   URL: https://tu-proyecto.web.app
   ```

---

## 🔧 Configuración Previa al Despliegue

### 1. Verificar Credenciales de Supabase

```javascript
// En src/js/config.js, asegúrate de tener:
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...'; // Tu clave real
```

⚠️ **IMPORTANTE**: La clave ANON es pública y está bien incluirla en el código.

### 2. Actualizar URLs del Service Worker

```javascript
// En public/service-worker.js
// Si tu app NO está en la raíz, actualiza las rutas:

const urlsToCache = [
  '/cialo-finanzas/',                    // Si está en subdirectorio
  '/cialo-finanzas/index.html',
  '/cialo-finanzas/src/css/styles.css',
  // ...
];
```

### 3. Configurar Manifest

```json
// En public/manifest.json
{
  "start_url": "/",                      // O "/cialo-finanzas/" si aplica
  "scope": "/"                           // O "/cialo-finanzas/" si aplica
}
```

---

## 🔐 Configuración de Seguridad

### 1. Configurar Dominios en Supabase

```
1. Ve a Supabase > Authentication > URL Configuration
2. Site URL: https://tu-dominio.com
3. Redirect URLs: Agrega todas las URLs donde estará tu app
   - https://tu-dominio.com
   - https://tu-dominio.netlify.app
   - http://localhost:8000 (para desarrollo)
```

### 2. Habilitar Confirmación de Email (Producción)

```
1. Supabase > Authentication > Providers
2. Enable email confirmations: ON
3. Personaliza las plantillas en Email Templates
```

---

## ✅ Checklist Pre-Despliegue

Antes de hacer deploy, verifica:

- [ ] Credenciales de Supabase son correctas
- [ ] Todas las tablas están creadas en Supabase
- [ ] Políticas de RLS están activas
- [ ] Usuario de prueba creado
- [ ] La app funciona en local (http://localhost:8000)
- [ ] Los iconos PWA están generados
- [ ] Service Worker tiene las rutas correctas
- [ ] No hay console.log() de depuración
- [ ] README.md está actualizado

---

## 🧪 Probar el Despliegue

### 1. Test Básico

```
1. Abre la URL de producción
2. Verifica que carga correctamente
3. Intenta hacer login
4. Crea un registro de prueba en cada módulo
5. Verifica que el Dashboard muestra datos
```

### 2. Test de PWA

```
1. Abre Chrome DevTools (F12)
2. Application > Manifest
   ✅ Debe mostrar toda la info del manifest
   
3. Application > Service Workers
   ✅ Debe aparecer como "activated"
   
4. Lighthouse (en DevTools)
   Ejecuta audit PWA
   ✅ Debe pasar todas las pruebas PWA
```

### 3. Test Mobile

```
1. Abre desde tu móvil
2. Debería aparecer el banner de "Instalar app"
3. Instala la PWA
4. Abre desde el ícono en la pantalla de inicio
5. Prueba offline (activa modo avión)
```

---

## 🚨 Solución de Problemas en Producción

### Problema: "Failed to fetch" en producción

**Solución**:
```
1. Verifica que la URL de Supabase sea correcta
2. Revisa en Supabase > Settings > API que el proyecto esté activo
3. Asegúrate de que las URLs estén configuradas en Authentication
```

### Problema: PWA no se instala

**Solución**:
```
1. Verifica que sea HTTPS (no HTTP)
2. Revisa en DevTools > Application > Manifest
3. Asegúrate de que todos los iconos existan
4. Verifica que el Service Worker esté registrado
```

### Problema: Los estilos no cargan

**Solución**:
```
1. Verifica las rutas en index.html
2. Si usas subdirectorio, actualiza:
   <link rel="stylesheet" href="./src/css/styles.css">
3. Fuerza recarga: Ctrl + Shift + R
```

### Problema: Error 404 en archivos

**Solución**:
```
1. Verifica la estructura de carpetas
2. Asegúrate de subir TODA la carpeta src/ y public/
3. En Netlify: Redeploy
4. Revisa en la consola del navegador qué archivos faltan
```

---

## 📊 Monitoreo en Producción

### Netlify Analytics (Gratis con plan Pro)
```
- Visitas
- Páginas más visitadas
- Dispositivos
- Ubicación geográfica
```

### Google Analytics (Gratis)
```html
<!-- Añade en index.html antes de </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔄 Actualizar la Aplicación

### Con Netlify/Vercel (desde Git)
```bash
# 1. Hacer cambios en el código
# 2. Commit
git add .
git commit -m "Actualización: [descripción]"

# 3. Push
git push origin main

# 4. Despliegue automático
# ✅ Netlify/Vercel detectan el cambio y despliegan automáticamente
```

### Con GitHub Pages
```bash
git add .
git commit -m "Update"
git push origin main

# Espera 2-3 minutos para que se actualice
```

### Con Firebase
```bash
firebase deploy
```

---

## 💰 Costos

### Hosting

| Servicio | Plan Gratis | Límites |
|----------|-------------|---------|
| **Netlify** | ✅ Sí | 100 GB/mes, 300 min build |
| **Vercel** | ✅ Sí | 100 GB/mes, builds ilimitados |
| **GitHub Pages** | ✅ Sí | 1 GB, 100 GB/mes |
| **Firebase** | ✅ Sí | 10 GB almacenamiento, 360 MB/día |

### Supabase

| Recurso | Plan Gratis | Límites |
|---------|-------------|---------|
| **Database** | ✅ Sí | 500 MB |
| **Storage** | ✅ Sí | 1 GB |
| **Bandwidth** | ✅ Sí | 5 GB/mes |
| **Auth** | ✅ Sí | Usuarios ilimitados |

**Total mensual**: $0 USD (para uso moderado)

---

## 🎯 Post-Despliegue

### Tareas Inmediatas

1. **Crear usuario administrador real**
   ```
   Supabase > Authentication > Users > Create user
   Email: admin@cialo.com
   Password: [contraseña segura]
   ```

2. **Configurar respaldos**
   ```
   Supabase > Database > Backups
   - Activar backups diarios automáticos
   - Probar restaurar un backup
   ```

3. **Documentar la URL**
   ```
   Anota la URL de producción:
   https://cialo-finanzas.netlify.app
   
   Compártela con el equipo
   ```

4. **Capacitar usuarios**
   ```
   - Mostrar cómo acceder
   - Explicar módulos básicos
   - Entregar credenciales
   - Compartir documentación (QUICKSTART.md)
   ```

---

## 📱 Dominio Personalizado (Opcional)

### Configurar dominio propio

Si tienes `cialo.com`:

1. **En tu proveedor de dominio** (GoDaddy, Namecheap, etc):
   ```
   Crea registro CNAME:
   Host: finanzas
   Value: tu-sitio.netlify.app
   TTL: 3600
   ```

2. **En Netlify**:
   ```
   Domain settings > Add custom domain
   Ingresa: finanzas.cialo.com
   Netlify verificará automáticamente
   ```

3. **SSL/HTTPS automático**:
   ```
   Netlify activará HTTPS automáticamente
   Espera 1-24 horas para que propague
   ```

---

## ✅ Proyecto en Producción

Una vez desplegado:

- ✅ URL accesible desde cualquier lugar
- ✅ HTTPS activado (seguro)
- ✅ PWA instalable en móviles
- ✅ Datos sincronizados con Supabase
- ✅ Backups automáticos
- ✅ Listo para uso real

---

**¡Felicitaciones! Tu aplicación está en producción.** 🎉

Ahora puedes compartir la URL con tu equipo y comenzar a usarla.
