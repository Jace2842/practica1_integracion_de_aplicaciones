
# Modelo de Datos - Fresh&Go

Este documento describe el modelo de datos diseñado para la integración de los sistemas de Fresh&Go.  
El modelo está implementado en **JSON Schema Draft-07**, con un esquema por cada entidad en la carpeta `/schemas`.

---

## 📌 Entidades y su función

- **Cliente**  
  Representa a un usuario final que realiza pedidos.  
  Incluye datos básicos de identificación y contacto.

- **Proveedor**  
  Representa a las empresas que suministran productos.  
  Se registran datos de identificación y contacto.

- **Producto**  
  Elemento básico de un pedido. Incluye información de identificación, nombre y cantidad.

- **Pedido**  
  Conjunto de productos solicitados por un cliente a un proveedor.  
  Incluye estado del pedido (pendiente, en tránsito, entregado).

- **Vehículo**  
  Elemento de la flota de transporte. Contiene datos de identificación, matrícula, capacidad y sensores IoT (GPS, temperatura).

- **Ruta**  
  Representa el trayecto que debe seguir un vehículo para realizar entregas.  
  Incluye lista de puntos de parada y estado de ejecución.

- **Incidencia**  
  Registro de problemas ocurridos durante la gestión de pedidos o transporte.  
  Incluye descripción, fecha y estado de resolución.

---

## 🔗 Relación entre entidades

- Un **Cliente** puede tener múltiples **Pedidos**.  
- Cada **Pedido** está asociado a un **Proveedor** y contiene múltiples **Productos**.  
- Un **Vehículo** puede estar asignado a una **Ruta** que cubra varios pedidos.  
- Una **Ruta** puede generar **Incidencias** relacionadas con uno o más **Pedidos**.  
- Una **Incidencia** siempre está asociada a un **Pedido**.

Esquema simplificado de relaciones:

```
Cliente 1---* Pedido *---1 Proveedor
Pedido  *---* Producto
Vehículo 1---1 Ruta
Pedido 1---* Incidencia
```

---

## 📝 Decisiones de diseño

1. **Uso de identificadores (`id`) tipo string**  
   - Se eligió este tipo para permitir UUIDs o IDs alfanuméricos flexibles.  
   - Facilita la interoperabilidad entre sistemas.

2. **Separación de `Pedido` y `Producto`**  
   - Un producto puede aparecer en múltiples pedidos.  
   - Se evita duplicar información.

3. **Campos de contacto en Cliente y Proveedor**  
   - Email es obligatorio en Cliente para comunicaciones.  
   - En Proveedor es opcional, pues puede haber múltiples canales de contacto.

4. **Monitorización IoT en Vehículo**  
   - Campos `gps` y `temperatura` permiten seguimiento en tiempo real.  
   - Se definió `temperatura` como `number` para incluir valores decimales.

5. **Estados predefinidos en Pedido y Ruta**  
   - Se usaron `enum` para garantizar consistencia en el ciclo de vida.  
   - Pedido: `pendiente`, `en_transito`, `entregado`.  
   - Ruta: `planificada`, `en_progreso`, `finalizada`.

6. **Formato de fecha en Incidencia**  
   - Se utilizó `format: date-time` para cumplir con ISO 8601.  
   - Facilita validación y uso en sistemas externos.

---

## 📂 Estructura de la carpeta `/schemas`

```
/schemas
├── cliente.schema.json
├── proveedor.schema.json
├── producto.schema.json
├── pedido.schema.json
├── vehiculo.schema.json
├── ruta.schema.json
└── incidencia.schema.json
```

Cada archivo corresponde a una entidad y define su estructura de validación.
