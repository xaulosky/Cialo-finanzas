# 💡 Ejemplos de Uso - Cialo Finanzas

Esta guía muestra ejemplos prácticos de cómo usar el sistema día a día.

## 📊 Flujo de Trabajo Diario Recomendado

### 1. Inicio del Día
```
1. Abrir la aplicación (http://localhost:8000 o PWA instalada)
2. Iniciar sesión
3. Revisar el Dashboard para ver el estado financiero actual
```

### 2. Registro de Ganancias (Ingresos)
```
Dashboard > Ganancias > + Nueva Ganancia

Ejemplo: Consulta Médica
- Fecha: 2024-12-06
- Tipo: Consulta Médica
- Descripción: Consulta general - Revisión anual
- Paciente: Juan Pérez (opcional)
- Monto: 150.00
- Método: Efectivo

💡 Tip: Registra las ganancias inmediatamente después de cada servicio
```

### 3. Registro de Gastos Operacionales
```
Dashboard > Gastos > + Nuevo Gasto

Ejemplo: Pago de Luz
- Fecha: 2024-12-05
- Categoría: Luz
- Descripción: Recibo de electricidad - Diciembre 2024
- Monto: 280.50
- Comprobante: FACT-2024-120

💡 Tip: Digitaliza o fotografía los comprobantes y guárdalos con el número
```

### 4. Pago de Sueldos (Mensual)
```
Dashboard > Sueldos > Pestaña "Pagos" > + Registrar Pago

Ejemplo: Pago Mensual
- Empleado: Dra. María González
- Fecha: 2024-12-01 (primer día del mes)
- Período: 2024-12 (diciembre 2024)
- Monto: 3,500.00 (se autocompleta)
- Método: Transferencia
- Observaciones: Pago completo mes de diciembre

💡 Tip: Registra todos los pagos el mismo día para llevar mejor control
```

---

## 🎯 Casos de Uso Específicos

### Caso 1: Compra a Proveedor

**Escenario**: Compraste medicamentos a tu proveedor habitual.

```
1. Dashboard > Proveedores
2. Busca el proveedor en la lista
3. Clic en "Ver Transacciones"
4. Clic en "+ Nueva Transacción"

Datos:
- Fecha: 2024-12-06
- Tipo: Compra
- Descripción: Medicamentos varios - Pedido #123
- Monto: 1,250.00
- Comprobante: FAC-2024-456

💡 Esto se registra automáticamente como gasto
```

### Caso 2: Nuevo Empleado

**Escenario**: Contratas a un nuevo recepcionista.

```
1. Dashboard > Sueldos > Pestaña "Empleados"
2. Clic en "+ Nuevo Empleado"

Datos:
- Nombre: Carlos Ramírez
- Cargo: Recepcionista
- Salario: 1,200.00
- Fecha de ingreso: 2024-12-15
- Email: cramírez@cialo.com
- Teléfono: 555-9876

💡 El sistema lo agregará automáticamente al selector de pagos
```

### Caso 3: Revisión Mensual

**Escenario**: Fin de mes, necesitas ver un resumen.

```
1. Dashboard (vista principal)
2. Observa las tarjetas de estadísticas:
   - ✅ Total de Gastos del mes
   - ✅ Total de Sueldos pagados
   - ✅ Total de Ganancias
   - ✅ Balance (Ganancias - Gastos - Sueldos)

3. Revisa el gráfico de tendencia de 6 meses

4. Para detalles:
   - Gastos > Filtrar por mes actual
   - Sueldos > Ver todos los pagos del mes
   - Ganancias > Revisar servicios por tipo
```

### Caso 4: Filtrar por Período

**Escenario**: Necesitas ver los gastos de un mes específico.

```
1. Dashboard > Gastos
2. Selector de mes: Elegir "2024-11" (noviembre)
3. (Opcional) Selector de categoría: "Alquiler"
4. Ver lista filtrada con el total al inicio

💡 Aplica para todas las secciones: Gastos, Sueldos, Ganancias
```

---

## 📈 Reportes y Análisis

### Análisis de Gastos por Categoría

```
1. Dashboard > Gastos
2. Filtrar por mes: 2024-12
3. Cambiar categoría una por una:
   - Luz: XXX
   - Agua: XXX
   - Materiales: XXX
   
💡 Tip: Anota los totales para identificar dónde más gastas
```

### Análisis de Ganancias por Servicio

```
1. Dashboard > Ganancias
2. Filtrar por tipo de servicio:
   - Consultas: XXX
   - Tratamientos: XXX
   - Cirugías: XXX
   
💡 Identifica qué servicios generan más ingresos
```

### Balance Mensual

```
Fórmula automática en el Dashboard:

Balance = Ganancias - (Gastos Operacionales + Sueldos)

Ejemplo:
- Ganancias: S/ 15,000
- Gastos: S/ 3,500
- Sueldos: S/ 8,000
- Balance: S/ 3,500 (positivo ✅)

Si el balance es negativo (en rojo), revisa tus gastos
```

---

## 🔄 Flujos Administrativos

### Flujo: Inicio de Mes

```
Día 1 del mes:
1. ✅ Registrar pago de alquiler
2. ✅ Pagar sueldos a todos los empleados
3. ✅ Revisar facturas pendientes de proveedores
4. ✅ Planificar gastos del mes

Día 5-10:
5. ✅ Registrar pagos de servicios (luz, agua, internet)
6. ✅ Actualizar pagos a proveedores
```

### Flujo: Fin de Mes

```
Últimos 5 días del mes:
1. ✅ Revisar Dashboard general
2. ✅ Verificar que todos los pagos estén registrados
3. ✅ Generar lista de gastos pendientes para el siguiente mes
4. ✅ Comparar balance con el mes anterior (usar gráfico)
```

---

## ⚡ Tips y Mejores Prácticas

### 💰 Ganancias

- ✅ Registra cada servicio inmediatamente
- ✅ Usa descripciones claras
- ✅ Especifica el método de pago
- ❌ No olvides registrar servicios pequeños

### 💸 Gastos

- ✅ Guarda los comprobantes físicos o digitales
- ✅ Categoriza correctamente cada gasto
- ✅ Añade el número de comprobante
- ❌ No mezcles gastos personales con los de la clínica

### 👥 Sueldos

- ✅ Registra pagos el mismo día cada mes
- ✅ Mantén actualizados los datos de contacto
- ✅ Añade observaciones si hay deducciones o bonos
- ❌ No olvides actualizar salarios cuando cambien

### 🏢 Proveedores

- ✅ Mantén actualizados los datos de contacto
- ✅ Registra tanto compras como pagos
- ✅ Usa el campo "Tipo" para organizar proveedores
- ❌ No elimines proveedores, mejor desactívalos

---

## 📱 Uso en Móvil (PWA)

### Ventajas de instalar como PWA:

1. **Acceso rápido**: Ícono en la pantalla de inicio
2. **Funciona offline**: Consulta datos sin internet
3. **Notificaciones**: (en futuras versiones)
4. **Más rápido**: Se carga instantáneamente

### Registro rápido en móvil:

```
1. Abre la PWA desde el ícono
2. Login (se guarda automáticamente)
3. Menú inferior > Toca el módulo que necesitas
4. Botón "+" > Llena el formulario
5. Guardar

💡 Todo se sincroniza con la base de datos al instante
```

---

## 🎓 Capacitación de Nuevos Usuarios

### Lección 1: Conceptos Básicos (15 min)
```
1. Explicar la estructura: Dashboard + 4 módulos
2. Mostrar cómo navegar entre vistas
3. Demostrar login/logout
4. Enseñar a leer el Dashboard
```

### Lección 2: Registro de Datos (30 min)
```
1. Registrar una ganancia de ejemplo
2. Registrar un gasto de ejemplo
3. Mostrar cómo buscar y filtrar
4. Practicar editar y eliminar registros
```

### Lección 3: Gestión Mensual (20 min)
```
1. Proceso de pago de sueldos
2. Registro de gastos fijos mensuales
3. Interpretación del balance
4. Análisis del gráfico de tendencias
```

---

## 🆘 Situaciones Comunes

### "Olvidé registrar un gasto de hace una semana"

✅ **Solución**: Registra el gasto con la fecha correcta. El sistema acepta fechas pasadas.

### "Me equivoqué en el monto de una ganancia"

✅ **Solución**: Busca el registro, clic en ✏️ (editar), corrige el monto, guarda.

### "Necesito eliminar un registro duplicado"

✅ **Solución**: Clic en 🗑️ (eliminar) en el registro correcto. Confirma la eliminación.

### "Un empleado renunció, ¿lo elimino?"

✅ **Solución**: NO lo elimines. Mejor desactívalo:
```
Sueldos > Empleados > Botón "Desactivar"
```
Así mantienes el histórico de pagos.

---

## 📊 Ejemplos de Datos Realistas

### Mes Típico de una Clínica Pequeña

```
GANANCIAS (Diciembre 2024):
- 40 Consultas × S/ 150 = S/ 6,000
- 15 Tratamientos × S/ 450 = S/ 6,750
- 5 Cirugías × S/ 2,500 = S/ 12,500
- 20 Servicios estéticos × S/ 280 = S/ 5,600
TOTAL GANANCIAS: S/ 30,850

GASTOS OPERACIONALES:
- Alquiler: S/ 2,500
- Luz: S/ 380
- Agua: S/ 120
- Internet: S/ 180
- Materiales médicos: S/ 1,200
- Limpieza: S/ 250
TOTAL GASTOS: S/ 4,630

SUELDOS:
- 2 Médicos × S/ 3,500 = S/ 7,000
- 1 Enfermera × S/ 1,800 = S/ 1,800
- 1 Recepcionista × S/ 1,200 = S/ 1,200
TOTAL SUELDOS: S/ 10,000

BALANCE: S/ 30,850 - S/ 4,630 - S/ 10,000 = S/ 16,220 ✅
```

---

**¿Tienes más casos de uso?** Documéntalos aquí para referencia futura.
