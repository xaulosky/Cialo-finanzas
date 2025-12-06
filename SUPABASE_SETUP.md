# 📘 Guía de Configuración de Supabase

Esta guía te llevará paso a paso por la configuración completa de Supabase para Cialo Finanzas.

## 🚀 Paso 1: Crear Cuenta y Proyecto

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Crea una cuenta (puedes usar GitHub, Google o email)
4. Una vez dentro, haz clic en "New Project"
5. Completa los datos:
   - **Name**: Cialo Finanzas
   - **Database Password**: Crea una contraseña segura (guárdala bien)
   - **Region**: Selecciona la más cercana a tu ubicación
   - **Pricing Plan**: Free (0 USD/mes)
6. Haz clic en "Create new project"
7. Espera 2-3 minutos mientras se crea el proyecto

## 📊 Paso 2: Crear las Tablas de Base de Datos

1. En el menú lateral, ve a **SQL Editor**
2. Haz clic en "+ New query"
3. Copia y pega el contenido completo del archivo `database-setup.sql`
4. Haz clic en "Run" (o presiona Ctrl+Enter)
5. Verifica que aparezca el mensaje: "Success. No rows returned"

### Verificar que las tablas se crearon

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver las siguientes tablas:
   - gastos_operacionales
   - empleados
   - pagos_sueldos
   - proveedores
   - transacciones_proveedores
   - ganancias

## 🔐 Paso 3: Configurar Autenticación

1. Ve a **Authentication** en el menú lateral
2. Haz clic en **Providers**
3. Asegúrate de que "Email" esté habilitado (switch en verde)
4. Configura las opciones:
   - **Enable email confirmations**: Desactívalo para desarrollo (puedes activarlo después)
   - **Secure email change**: Actívalo
   - **Secure password change**: Actívalo

### Crear el primer usuario

1. En Authentication, ve a **Users**
2. Haz clic en "Add user" > "Create new user"
3. Completa:
   - **Email**: Tu email de administrador (ej: admin@cialo.com)
   - **Password**: Una contraseña segura
   - **Auto Confirm User**: Activado
4. Haz clic en "Create user"

## 🔑 Paso 4: Obtener las Credenciales

1. Ve a **Project Settings** (icono de engranaje en el menú lateral)
2. Ve a **API**
3. Copia las siguientes credenciales:

   - **Project URL**: Algo como `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: Una clave larga que empieza con `eyJ...`

4. NO copies la `service_role` key (es privada y no debe usarse en el frontend)

## ⚙️ Paso 5: Configurar la Aplicación

1. Abre el archivo `src/js/config.js` en tu editor de código
2. Reemplaza las siguientes líneas:

```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co'; // Pega tu Project URL
const SUPABASE_ANON_KEY = 'eyJ...'; // Pega tu anon public key
```

3. Guarda el archivo

## ✅ Paso 6: Verificar la Configuración

### Verificar RLS (Row Level Security)

1. Ve a **Authentication** > **Policies**
2. Deberías ver políticas para cada tabla:
   - gastos_operacionales (4 políticas)
   - empleados (4 políticas)
   - pagos_sueldos (4 políticas)
   - proveedores (4 políticas)
   - transacciones_proveedores (4 políticas)
   - ganancias (4 políticas)

### Verificar índices

1. Ve a **SQL Editor**
2. Ejecuta esta consulta para ver los índices:

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

## 🧪 Paso 7: Probar la Conexión

1. Abre la aplicación en tu navegador (`http://localhost:8000`)
2. Intenta hacer login con las credenciales del usuario creado
3. Si funciona, verás el dashboard
4. Prueba agregar un gasto, empleado o ganancia

## 📝 Paso 8: Insertar Datos de Ejemplo (Opcional)

Si quieres datos de prueba, ejecuta en el SQL Editor:

```sql
-- Empleados de ejemplo
INSERT INTO empleados (nombre_completo, cargo, salario_mensual, fecha_ingreso, email, telefono) VALUES
('Dr. Juan Pérez', 'Médico General', 3500.00, '2023-01-15', 'jperez@cialo.com', '555-1234'),
('María González', 'Enfermera', 1800.00, '2023-02-01', 'mgonzalez@cialo.com', '555-5678'),
('Ana Torres', 'Recepcionista', 1200.00, '2023-03-10', 'atorres@cialo.com', '555-9012');

-- Proveedores de ejemplo
INSERT INTO proveedores (nombre, ruc, contacto, telefono, tipo) VALUES
('Farmacia MediSupply', '20123456789', 'Carlos Ruiz', '555-1111', 'medicamentos'),
('Equipos Médicos SAC', '20987654321', 'Laura Vega', '555-2222', 'equipos'),
('Limpieza Total', '20456789123', 'Pedro Sánchez', '555-3333', 'limpieza');

-- Gastos de ejemplo
INSERT INTO gastos_operacionales (fecha, categoria, descripcion, monto, comprobante) VALUES
('2024-12-01', 'luz', 'Pago de electricidad Diciembre', 250.50, 'FACT-2024-001'),
('2024-12-05', 'agua', 'Servicio de agua Diciembre', 80.00, 'FACT-2024-002'),
('2024-12-10', 'internet', 'Plan empresarial 100MB', 120.00, 'FACT-2024-003');

-- Ganancias de ejemplo
INSERT INTO ganancias (fecha, tipo_servicio, descripcion, monto, paciente, metodo_pago) VALUES
('2024-12-01', 'consulta', 'Consulta general', 150.00, 'Juan Ramírez', 'efectivo'),
('2024-12-02', 'tratamiento', 'Tratamiento facial', 450.00, 'María López', 'tarjeta'),
('2024-12-03', 'estetica', 'Limpieza facial profunda', 280.00, 'Ana Martínez', 'transferencia');
```

## 🔧 Solución de Problemas Comunes

### Error: "Invalid API key"
- Verifica que copiaste correctamente la `anon public` key (no la `service_role`)
- Asegúrate de que no haya espacios al inicio o final

### Error: "Failed to fetch"
- Verifica que la URL del proyecto sea correcta
- Asegúrate de estar sirviendo la aplicación desde un servidor HTTP (no file://)

### No puedo hacer login
- Verifica que el usuario esté creado en Authentication > Users
- Asegúrate de que "Auto Confirm User" esté activado
- Revisa que el email y contraseña sean correctos

### No se cargan los datos
- Verifica que las políticas de RLS estén activas
- Revisa la consola del navegador (F12) para ver errores específicos
- Asegúrate de estar autenticado

## 📊 Monitoreo y Uso

### Ver estadísticas de uso

1. Ve a **Settings** > **Usage**
2. Aquí puedes ver:
   - Número de usuarios activos
   - Storage utilizado
   - Ancho de banda consumido
   - Consultas a la base de datos

### Límites del plan Free

- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 5 GB
- **Users**: Ilimitados

Si necesitas más, puedes actualizar al plan Pro ($25/mes).

## 🔐 Seguridad Adicional (Recomendado)

### 1. Activar confirmación de email

1. Ve a Authentication > Email Templates
2. Personaliza las plantillas de correo
3. Activa "Enable email confirmations" en Providers

### 2. Configurar dominios permitidos

1. Ve a Authentication > URL Configuration
2. Agrega tu dominio de producción en "Site URL"
3. Agrega dominios en "Redirect URLs"

### 3. Respaldos automáticos

1. Ve a Database > Backups
2. Los respaldos diarios están incluidos en el plan Free
3. Puedes descargar respaldos manualmente

## 📞 Soporte

- **Documentación oficial**: [https://supabase.com/docs](https://supabase.com/docs)
- **Community**: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord**: [https://discord.supabase.com](https://discord.supabase.com)

---

¡Configuración completada! Tu base de datos está lista para usar. 🎉
