# CRM Fresh&Go - Contratos y Documentación de API

## Descripción General

El **servicio CRM** gestiona la información de clientes, pedidos, proveedores, conductores y rutas de Fresh&Go. Proporciona una API REST completa para acceder y gestionar estos recursos.

### Características Principales

- **Base de datos PostgreSQL**: Almacenamiento persistente
- **Paginación**: Control de resultados en todas las colecciones
- **Búsqueda**: Filtros por múltiples criterios
- **Relaciones**: Pedidos con productos, rutas con conductores
- **CORS habilitado**: Accesible desde cualquier origen

---

## URL Base

```
http://localhost:3001
```

---

## Endpoints

### 1. **GET /** - Información del Servicio

#### Descripción
Devuelve información general sobre el servicio CRM.

#### Request
```http
GET http://localhost:3001/
```

#### Response (200 OK)
```json
{
  "servicio": "CRM Fresh&Go",
  "version": "2.0.0",
  "descripcion": "Sistema de gestión de clientes, pedidos y proveedores",
  "base_de_datos": "PostgreSQL",
  "endpoints": [
    "GET /clientes",
    "GET /clientes/:id",
    "GET /pedidos",
    "GET /pedidos/:id",
    "GET /proveedores",
    "GET /proveedores/:id",
    "GET /conductores",
    "GET /conductores/:id",
    "GET /rutas",
    "GET /rutas/:id",
    "GET /health"
  ]
}
```

---

### 2. **GET /health** - Health Check

#### Descripción
Verifica el estado de la conexión con la base de datos PostgreSQL.

#### Request
```http
GET http://localhost:3001/health
```

#### Response (200 OK)
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

#### Response (500 Internal Server Error)
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "Connection timeout"
}
```

---

### 3. **GET /clientes** - Listar Clientes

#### Descripción
Obtiene el listado de clientes con paginación y búsqueda opcional.

#### Request
```http
GET http://localhost:3001/clientes?q=supermercado&page=1&pageSize=25
```

#### Parámetros de Query (Opcionales)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `q` | string | Búsqueda por nombre o email | `supermercado` |
| `page` | integer | Número de página (default: 1) | `1` |
| `pageSize` | integer | Tamaño de página (default: 25, max: 100) | `25` |

#### Response (200 OK)
```json
{
  "total": 5,
  "page": 1,
  "pageSize": 25,
  "data": [
    {
      "id": "CLI001",
      "nombre": "Supermercado Central",
      "email": "compras@central.com",
      "direccion": "Calle Mayor 45, Madrid",
      "telefono": "+34-91-555-1234"
    },
    {
      "id": "CLI002",
      "nombre": "Restaurante El Buen Sabor",
      "email": "pedidos@buensabor.com",
      "direccion": "Avenida Principal 78, Barcelona",
      "telefono": "+34-93-222-5678"
    }
  ]
}
```

---

### 4. **GET /clientes/:id** - Obtener Cliente por ID

#### Descripción
Obtiene los detalles de un cliente específico.

#### Request
```http
GET http://localhost:3001/clientes/CLI001
```

#### Response (200 OK)
```json
{
  "id": "CLI001",
  "nombre": "Supermercado Central",
  "email": "compras@central.com",
  "direccion": "Calle Mayor 45, Madrid",
  "telefono": "+34-91-555-1234"
}
```

#### Response (404 Not Found)
```json
{
  "error": "Cliente no encontrado"
}
```

---

### 5. **GET /pedidos** - Listar Pedidos

#### Descripción
Obtiene el listado de pedidos con productos incluidos, filtros y paginación.

#### Request
```http
GET http://localhost:3001/pedidos?clienteId=CLI001&estado=en_transito&page=1&pageSize=25
```

#### Parámetros de Query (Opcionales)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `clienteId` | string | Filtrar por cliente | `CLI001` |
| `estado` | string | Filtrar por estado (`pendiente`, `en_transito`, `entregado`) | `en_transito` |
| `page` | integer | Número de página (default: 1) | `1` |
| `pageSize` | integer | Tamaño de página (default: 25, max: 100) | `25` |

#### Response (200 OK)
```json
{
  "total": 8,
  "page": 1,
  "pageSize": 25,
  "data": [
    {
      "id": "PED001",
      "clienteId": "CLI001",
      "proveedorId": "PROV001",
      "estado": "en_transito",
      "fechaPedido": "2025-11-20T08:00:00.000Z",
      "fechaEntrega": "2025-11-26T15:00:00.000Z",
      "productos": [
        {
          "id": "PROD001",
          "nombre": "Helado Vainilla 5L",
          "cantidad": 10
        },
        {
          "id": "PROD002",
          "nombre": "Pizza Congelada",
          "cantidad": 20
        }
      ]
    }
  ]
}
```

---

### 6. **GET /pedidos/:id** - Obtener Pedido por ID

#### Descripción
Obtiene los detalles de un pedido específico con sus productos.

#### Request
```http
GET http://localhost:3001/pedidos/PED001
```

#### Response (200 OK)
```json
{
  "id": "PED001",
  "clienteId": "CLI001",
  "proveedorId": "PROV001",
  "estado": "en_transito",
  "fechaPedido": "2025-11-20T08:00:00.000Z",
  "fechaEntrega": "2025-11-26T15:00:00.000Z",
  "productos": [
    {
      "id": "PROD001",
      "nombre": "Helado Vainilla 5L",
      "cantidad": 10
    }
  ]
}
```

#### Response (404 Not Found)
```json
{
  "error": "Pedido no encontrado"
}
```

---

### 7. **GET /proveedores** - Listar Proveedores

#### Descripción
Obtiene el listado completo de proveedores.

#### Request
```http
GET http://localhost:3001/proveedores
```

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": "PROV001",
      "nombre": "Distribuidora Congelados del Norte",
      "email": "ventas@congeladosnorte.com",
      "telefono": "+34-91-888-1234",
      "especialidad": "congelados"
    },
    {
      "id": "PROV002",
      "nombre": "FreshFruit Logistics",
      "email": "info@freshfruit.com",
      "telefono": "+34-93-777-5678",
      "especialidad": "frutas_verduras"
    }
  ]
}
```

---

### 8. **GET /proveedores/:id** - Obtener Proveedor por ID

#### Descripción
Obtiene los detalles de un proveedor específico.

#### Request
```http
GET http://localhost:3001/proveedores/PROV001
```

#### Response (200 OK)
```json
{
  "id": "PROV001",
  "nombre": "Distribuidora Congelados del Norte",
  "email": "ventas@congeladosnorte.com",
  "telefono": "+34-91-888-1234",
  "especialidad": "congelados"
}
```

#### Response (404 Not Found)
```json
{
  "error": "Proveedor no encontrado"
}
```

---

### 9. **GET /conductores** - Listar Conductores

#### Descripción
Obtiene el listado completo de conductores con su disponibilidad.

#### Request
```http
GET http://localhost:3001/conductores
```

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": "COND001",
      "nombre": "Juan Pérez",
      "licencia": "B-12345678",
      "telefono": "+34-600-111-222",
      "disponibilidad": true
    },
    {
      "id": "COND002",
      "nombre": "María García",
      "licencia": "B-87654321",
      "telefono": "+34-600-333-444",
      "disponibilidad": false
    }
  ]
}
```

---

### 10. **GET /conductores/:id** - Obtener Conductor por ID

#### Descripción
Obtiene los detalles de un conductor específico.

#### Request
```http
GET http://localhost:3001/conductores/COND001
```

#### Response (200 OK)
```json
{
  "id": "COND001",
  "nombre": "Juan Pérez",
  "licencia": "B-12345678",
  "telefono": "+34-600-111-222",
  "disponibilidad": true
}
```

#### Response (404 Not Found)
```json
{
  "error": "Conductor no encontrado"
}
```

---

### 11. **GET /rutas** - Listar Rutas

#### Descripción
Obtiene el listado de rutas con información del conductor asignado.

#### Request
```http
GET http://localhost:3001/rutas
```

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": "RUTA001",
      "nombre": "Ruta Centro Madrid",
      "conductorId": "COND001",
      "vehiculoId": "VEH001",
      "estado": "activa",
      "horaInicio": "08:00:00",
      "horaFin": "16:00:00"
    }
  ]
}
```

---

### 12. **GET /rutas/:id** - Obtener Ruta por ID

#### Descripción
Obtiene los detalles de una ruta específica.

#### Request
```http
GET http://localhost:3001/rutas/RUTA001
```

#### Response (200 OK)
```json
{
  "id": "RUTA001",
  "nombre": "Ruta Centro Madrid",
  "conductorId": "COND001",
  "vehiculoId": "VEH001",
  "estado": "activa",
  "horaInicio": "08:00:00",
  "horaFin": "16:00:00"
}
```

#### Response (404 Not Found)
```json
{
  "error": "Ruta no encontrada"
}
```

---

## Manejo de Errores

### Tipos de Errores

#### 1. **400 Bad Request** - Parámetros Inválidos
```json
{
  "error": "Parámetros de paginación inválidos"
}
```

#### 2. **404 Not Found** - Recurso No Encontrado
```json
{
  "error": "Cliente no encontrado"
}
```

#### 3. **500 Internal Server Error** - Error del Servidor
```json
{
  "error": "Error interno del servidor",
  "details": "connection to server failed"
}
```

---

## Variables de Entorno

Crear archivo `.env` en `/services/crm/`:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fresh_and_go_crm
DB_USER=postgres
DB_PASSWORD=postgres
```

---

## Instalación y Ejecución

### Instalar dependencias
```bash
cd services/crm
npm install
```

### Iniciar servicio
```bash
npm start
```

---

## Dependencias (package.json)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

---

## Base de Datos

### Tablas Principales

- **clientes**: Información de clientes
- **pedidos**: Pedidos realizados por clientes
- **productos_pedido**: Relación muchos a muchos entre pedidos y productos
- **proveedores**: Proveedores de productos
- **conductores**: Conductores de vehículos
- **rutas**: Rutas de distribución

### Inicialización

```bash
psql -U postgres -d fresh_and_go_crm -f database/crear_tablas.sql
psql -U postgres -d fresh_and_go_crm -f database/datos_semilla.sql
```

---

## Pruebas con Postman

Importar la colección desde:
```
/docs/postman_collection.json
```

### Tests Recomendados

1. ✅ Health Check
2. ✅ Listar clientes sin filtros
3. ✅ Listar clientes con búsqueda
4. ✅ Obtener cliente específico
5. ✅ Listar pedidos con filtros
6. ✅ Obtener pedido con productos
7. ✅ Listar proveedores
8. ✅ Listar conductores
9. ✅ Listar rutas

---

## Soporte

Para más información, consultar:
- README.md del servicio
- Código fuente en `/services/crm`
- Scripts SQL en `/database`
