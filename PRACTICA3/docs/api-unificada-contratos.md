# API Unificada - Contratos y Documentación

## Descripción General

La **API Unificada** es la capa de integración entre los servicios CRM e IoT de Fresh&Go. Actúa como punto de entrada único para los clientes, consolidando información de ambos sistemas y proporcionando datos enriquecidos.

### Características Principales

- **Integración CRM + IoT**: Combina datos de clientes, pedidos, vehículos y sensores
- **Validación con JSON Schema**: Garantiza consistencia en las respuestas
- **Caché inteligente**: Reduce latencia con TTL configurable (60s por defecto)
- **Logging robusto**: Winston para trazabilidad completa
- **Filtros avanzados**: Por sensor, tipo de alimento, fecha y estado
- **Paginación**: Control de volumen de datos en respuestas
- **Manejo de errores**: Respuestas degradadas cuando un servicio no está disponible

---

## Arquitectura

```
Cliente/Postman
     │
     ▼
API Unificada (puerto 4000)
     │
     ├──────────────┬─────────────┐
     ▼              ▼             ▼
 CRM (3001)    IoT (8001)    Cache
```

---

## URL Base

```
http://localhost:4000
```

---

## Endpoints

### 1. **GET /** - Información del Servicio

#### Descripción
Devuelve información general sobre la API Unificada, sus características y estado de los servicios integrados.

#### Request
```http
GET http://localhost:4000/
```

#### Response (200 OK)
```json
{
  "servicio": "API Unificada Fresh&Go",
  "version": "2.0.0",
  "nivel": "Nivel 2 - Completo",
  "caracteristicas": [
    "Validación de datos con JSON Schema",
    "Filtros y paginación avanzada",
    "Manejo robusto de errores",
    "Cacheo inteligente (TTL: 60s)",
    "Logging con Winston"
  ],
  "servicios_integrados": {
    "crm": {
      "url": "http://localhost:3001",
      "estado": "conectado"
    },
    "iot": {
      "url": "http://localhost:8001",
      "estado": "conectado"
    }
  }
}
```

---

### 2. **GET /health** - Health Check

#### Descripción
Verifica el estado de conexión con los servicios CRM e IoT.

#### Request
```http
GET http://localhost:4000/health
```

#### Response (200 OK - Todos los servicios disponibles)
```json
{
  "status": "healthy",
  "timestamp": "2025-11-26T10:30:00.000Z",
  "services": {
    "crm": {
      "url": "http://localhost:3001",
      "status": "up",
      "data": { "database": "connected" }
    },
    "iot": {
      "url": "http://localhost:8001",
      "status": "up",
      "data": { "database": "connected" }
    }
  }
}
```

#### Response (503 Service Unavailable - Algún servicio caído)
```json
{
  "status": "degraded",
  "timestamp": "2025-11-26T10:30:00.000Z",
  "services": {
    "crm": {
      "url": "http://localhost:3001",
      "status": "down",
      "error": "connect ECONNREFUSED 127.0.0.1:3001"
    },
    "iot": {
      "url": "http://localhost:8001",
      "status": "up",
      "data": { "database": "connected" }
    }
  }
}
```

---

### 3. **GET /clientes/detalle/:clienteId** - Detalle Completo de Cliente

#### Descripción
Obtiene información completa de un cliente, incluyendo:
- Datos básicos del cliente (CRM)
- Pedidos del cliente (CRM)
- **Vehículos relacionados** - Solo vehículos involucrados en pedidos del cliente (IoT)
- Sensores de cada vehículo relacionado (IoT)
- Lecturas de temperatura/humedad de cada sensor (IoT)

#### Request
```http
GET http://localhost:4000/clientes/detalle/CLI001?sensorId=SENS001&tipoAlimento=congelado&from=2025-11-01T00:00:00Z&to=2025-11-26T23:59:59Z&estado=normal&limit=50&page=1
```

#### Parámetros de Query (Todos opcionales)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `sensorId` | string | Filtrar por sensor específico | `SENS001` |
| `tipoAlimento` | string | Tipo de alimento (`congelado`, `refrigerado`, `delicado`) | `congelado` |
| `from` | ISO-8601 | Fecha inicio para filtrar lecturas | `2025-11-01T00:00:00Z` |
| `to` | ISO-8601 | Fecha fin para filtrar lecturas | `2025-11-26T23:59:59Z` |
| `estado` | string | Estado de lecturas (`normal`, `alerta`, `critico`) | `normal` |
| `limit` | integer | Máximo de lecturas por sensor (default: 50, max: 100) | `50` |
| `page` | integer | Número de página para pedidos (default: 1) | `1` |

#### Response (200 OK)
```json
{
  "cliente": {
    "id": "CLI001",
    "nombre": "Supermercado Central",
    "email": "compras@central.com",
    "direccion": "Calle Mayor 45, Madrid",
    "telefono": "+34-91-555-1234"
  },
  "pedidos": [
    {
      "id": "PED001",
      "clienteId": "CLI001",
      "proveedorId": "PROV001",
      "conductorId": "COND001",
      "fechaPedido": "2025-11-20T08:00:00Z",
      "estado": "en_transito",
      "total": 1250.50
    }
  ],
  "vehiculos": [
    {
      "vehiculoId": "VEH001",
      "matricula": "1234ABC",
      "capacidadKg": 5000,
      "gps": { "lat": 40.4168, "lon": -3.7038 },
      "temperatura": -18.5,
      "sensores": [
        {
          "sensorId": "SENS001",
          "nombre": "Sensor Congelados 1",
          "tipoAlimento": "congelado",
          "rangoMin": -20,
          "rangoMax": -15,
          "umbralAlerta": -14,
          "umbralCritico": -12,
          "lecturas": [
            {
              "id": "LECT0001",
              "sensorId": "SENS001",
              "temperatura": -18.2,
              "humedad": 65,
              "timestamp": "2025-11-26T10:15:00Z",
              "estado": "normal"
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "timestamp": "2025-11-26T10:30:00.000Z",
    "totalPedidos": 1,
    "pedidosPaginados": 1,
    "page": 1,
    "pageSize": 50,
    "totalVehiculos": 1,
    "totalSensores": 1,
    "totalLecturas": 1,
    "filtrosAplicados": {
      "sensorId": "SENS001",
      "tipoAlimento": "congelado",
      "from": "2025-11-01T00:00:00Z",
      "to": "2025-11-26T23:59:59Z",
      "estado": "normal",
      "limit": 50
    },
    "tiempoRespuesta": "245ms",
    "cache": {
      "crm": false,
      "iot": false
    }
  }
}
```

#### Response (404 Not Found - Cliente no existe)
```json
{
  "error": "Error obteniendo datos del CRM",
  "details": "Cliente no encontrado",
  "servicio": "CRM",
  "code": "ECONNREFUSED"
}
```

#### Response (500 Internal Server Error - Validación falla)
```json
{
  "error": "La respuesta no cumple con el schema unificado",
  "validationErrors": [
    {
      "field": "/cliente/email",
      "message": "Field /cliente/email should match format email",
      "keyword": "format"
    }
  ]
}
```

---

### 4. **GET /resumen** - Resumen General

#### Descripción
Proporciona estadísticas agregadas de ambos sistemas (CRM e IoT).

#### Request
```http
GET http://localhost:4000/resumen
```

#### Response (200 OK)
```json
{
  "timestamp": "2025-11-26T10:30:00.000Z",
  "crm": {
    "disponible": true,
    "error": null,
    "stats": {
      "totalClientes": 5,
      "totalPedidos": 8,
      "pedidosPendientes": 2
    }
  },
  "iot": {
    "disponible": true,
    "error": null,
    "stats": {
      "totalSensores": 15,
      "totalVehiculos": 5,
      "alertasActivas": 8
    }
  },
  "integracion": {
    "estado": "completo",
    "serviciosDisponibles": ["CRM", "IoT"]
  }
}
```

#### Response (503 Service Unavailable - Servicios no disponibles)
```json
{
  "timestamp": "2025-11-26T10:30:00.000Z",
  "crm": {
    "disponible": false,
    "error": "connect ECONNREFUSED 127.0.0.1:3001",
    "stats": {}
  },
  "iot": {
    "disponible": false,
    "error": "connect ECONNREFUSED 127.0.0.1:8001",
    "stats": {}
  },
  "integracion": {
    "estado": "no_disponible",
    "serviciosDisponibles": []
  }
}
```

---

### 5. **GET /cache/stats** - Estadísticas de Caché

#### Descripción
Muestra estadísticas del sistema de caché interno.

#### Request
```http
GET http://localhost:4000/cache/stats
```

#### Response (200 OK)
```json
{
  "stats": {
    "keys": 5,
    "hits": 42,
    "misses": 8,
    "ksize": 5120,
    "vsize": 102400
  },
  "totalKeys": 5,
  "keys": [
    "crm:cliente:CLI001",
    "crm:pedidos:{\"clienteId\":\"CLI001\"}",
    "iot:vehiculos",
    "iot:sensores:{\"ubicacionId\":\"VEH001\"}"
  ],
  "ttl": 60
}
```

---

### 6. **DELETE /cache** - Limpiar Caché

#### Descripción
Invalida el caché completo o por patrón específico.

#### Request (Limpiar todo)
```http
DELETE http://localhost:4000/cache
```

#### Request (Limpiar patrón específico)
```http
DELETE http://localhost:4000/cache?pattern=crm:cliente
```

#### Response (200 OK)
```json
{
  "message": "Todo el cache ha sido limpiado"
}
```

---

## Validación con JSON Schema

Todas las respuestas del endpoint `/clientes/detalle/:clienteId` se validan contra el schema ubicado en:
```
/services/api-unificada/schemas/cliente-detalle.schema.json
```

### Ventajas de la Validación
- ✅ Garantiza estructura consistente
- ✅ Previene datos malformados
- ✅ Facilita debugging
- ✅ Documenta el contrato de la API

---

## Manejo de Errores

La API implementa manejo robusto de errores según el **Nivel 2**:

### Tipos de Errores

#### 1. **Timeout de Servicios**
```json
{
  "error": "Error obteniendo datos del CRM",
  "details": "Timeout of 5000ms exceeded",
  "servicio": "CRM",
  "code": "ETIMEDOUT"
}
```

#### 2. **Servicio No Disponible**
```json
{
  "error": "Error obteniendo datos del IoT",
  "details": "connect ECONNREFUSED 127.0.0.1:8001",
  "servicio": "IoT",
  "code": "ECONNREFUSED"
}
```

#### 3. **Validación Fallida**
```json
{
  "error": "La respuesta no cumple con el schema unificado",
  "validationErrors": [
    {
      "field": "/cliente/id",
      "message": "Field /cliente/id should match pattern ^CLI[0-9]{3}$",
      "keyword": "pattern"
    }
  ]
}
```

#### 4. **Endpoint No Encontrado**
```json
{
  "error": "Endpoint no encontrado",
  "url": "/invalid",
  "metodo": "GET",
  "endpoints_disponibles": [
    "GET /",
    "GET /health",
    "GET /cache/stats",
    "DELETE /cache",
    "GET /clientes/detalle/:clienteId",
    "GET /resumen"
  ]
}
```

---

## Logging (Winston)

### Configuración
- **Nivel**: Configurable via `LOG_LEVEL` (default: `info`)
- **Transports**:
  - Console (desarrollo)
  - `logs/error.log` (solo errores)
  - `logs/combined.log` (todos los logs)

### Ejemplo de Logs
```
[2025-11-26T10:30:00.000Z] info: [API Unificada] Solicitud detalle cliente CLI001 {"filters":{"sensorId":"SENS001"}}
[2025-11-26T10:30:00.120Z] info: [CRM] GET /clientes/CLI001
[2025-11-26T10:30:00.180Z] info: [IoT] GET /vehiculos
[2025-11-26T10:30:00.245Z] info: [API Unificada] Respuesta exitosa para cliente CLI001 {"tiempoRespuesta":"245ms"}
```

---

## Caché (NodeCache)

### Configuración
- **TTL**: 60 segundos (configurable via `CACHE_TTL`)
- **Check Period**: 120 segundos

### Claves Cacheadas
- `crm:cliente:{clienteId}`
- `crm:pedidos:{params}`
- `crm:proveedores`
- `crm:conductores`
- `iot:vehiculos`
- `iot:vehiculo:{vehiculoId}`
- `iot:sensores:{params}`

### Invalidación
- Manual via `DELETE /cache`
- Automática por TTL expirado

---

## Variables de Entorno

Crear archivo `.env` en `/services/api-unificada/`:

```env
PORT=4000
CRM_URL=http://localhost:3001
IOT_URL=http://localhost:8001
CACHE_TTL=60
LOG_LEVEL=info
```

---

## Instalación y Ejecución

### Instalar dependencias
```bash
cd services/api-unificada
npm install
```

### Iniciar en desarrollo
```bash
npm run dev
```

### Iniciar en producción
```bash
npm start
```

---

## Dependencias (package.json)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "ajv": "^8.12.0",
    "ajv-formats": "^2.1.1",
    "cors": "^2.8.5",
    "date-fns": "^2.30.0",
    "winston": "^3.11.0",
    "node-cache": "^5.1.2",
    "dotenv": "^16.3.1"
  }
}
```

---

## Pruebas con Postman

Importar la colección desde:
```
/docs/postman_api_unificada.json
```

### Tests Recomendados

1. ✅ **Health Check** - Verificar conectividad
2. ✅ **Detalle Cliente** - Sin filtros
3. ✅ **Detalle Cliente** - Con todos los filtros
4. ✅ **Resumen General** - Estadísticas
5. ✅ **Cache Stats** - Verificar caché
6. ✅ **Error Handling** - Apagar CRM/IoT y probar

---

## Nivel 2 - Checklist Completo

- ✅ Validación con JSON Schema (AJV)
- ✅ Filtros avanzados (sensor, tipo, fecha, estado)
- ✅ Paginación (limit, page)
- ✅ Manejo robusto de errores (timeout, ECONNREFUSED)
- ✅ Logging con Winston
- ✅ Caché con NodeCache (TTL 60s)
- ✅ date-fns para filtrado de fechas

---

## Soporte

Para más información, consultar:
- README.md del proyecto
- Código fuente en `/services/api-unificada`
- Schemas en `/services/api-unificada/schemas`
