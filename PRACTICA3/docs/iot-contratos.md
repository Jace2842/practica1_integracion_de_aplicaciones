# IoT Fresh&Go - Contratos y Documentación de API

## Descripción General

El **servicio IoT** gestiona el monitoreo en tiempo real de temperatura, GPS y estado de vehículos y sensores de la flota de Fresh&Go. Proporciona una API REST para acceder a datos de telemetría y alertas.

### Características Principales

- **Base de datos PostgreSQL**: Almacenamiento de lecturas y alertas
- **Monitoreo en tiempo real**: Temperatura, GPS y estado de sensores
- **Sistema de alertas**: Detección automática de anomalías
- **Cadena de frío**: Seguimiento de rotura de cadena
- **Filtros avanzados**: Por fecha, estado, ubicación y tipo de alimento
- **FastAPI**: Framework moderno de Python con documentación automática

---

## URL Base

```
http://localhost:8001
```

---

## Documentación Interactiva

FastAPI proporciona documentación automática en:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

---

## Endpoints

### 1. **GET /** - Información del Servicio

#### Descripción
Devuelve información general sobre el servicio IoT.

#### Request
```http
GET http://localhost:8001/
```

#### Response (200 OK)
```json
{
  "servicio": "IoT Fresh&Go",
  "version": "2.0.0",
  "descripcion": "Sistema de monitoreo de temperatura y GPS con PostgreSQL",
  "base_de_datos": "PostgreSQL",
  "endpoints": [
    "GET /sensores",
    "GET /sensores/{sensor_id}",
    "GET /lecturas",
    "GET /lecturas/alertas",
    "GET /lecturas/cadena-rota",
    "GET /vehiculos",
    "GET /vehiculos/{vehiculo_id}",
    "GET /incidencias",
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
GET http://localhost:8001/health
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
  "error": "Connection failed"
}
```

---

### 3. **GET /sensores** - Listar Sensores

#### Descripción
Obtiene el listado de sensores activos con filtros opcionales.

#### Request
```http
GET http://localhost:8001/sensores?ubicacionId=VEH001&tipoAlimento=congelado
```

#### Parámetros de Query (Opcionales)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `ubicacionId` | string | Filtrar por vehículo/ubicación | `VEH001` |
| `tipoAlimento` | string | Tipo de alimento (`congelado`, `refrigerado`, `delicado`) | `congelado` |

#### Response (200 OK)
```json
{
  "total": 3,
  "data": [
    {
      "id": "SENS001",
      "nombre": "Sensor Congelados 1",
      "tipo_alimento": "congelado",
      "ubicacion_id": "VEH001",
      "rango_min": -20.0,
      "rango_max": -15.0,
      "umbral_alerta": -14.0,
      "umbral_critico": -12.0,
      "activo": true
    },
    {
      "id": "SENS002",
      "nombre": "Sensor Refrigerados 1",
      "tipo_alimento": "refrigerado",
      "ubicacion_id": "VEH001",
      "rango_min": 2.0,
      "rango_max": 8.0,
      "umbral_alerta": 10.0,
      "umbral_critico": 12.0,
      "activo": true
    }
  ]
}
```

---

### 4. **GET /sensores/:sensor_id** - Obtener Sensor por ID

#### Descripción
Obtiene los detalles de un sensor específico.

#### Request
```http
GET http://localhost:8001/sensores/SENS001
```

#### Response (200 OK)
```json
{
  "id": "SENS001",
  "nombre": "Sensor Congelados 1",
  "tipo_alimento": "congelado",
  "ubicacion_id": "VEH001",
  "rango_min": -20.0,
  "rango_max": -15.0,
  "umbral_alerta": -14.0,
  "umbral_critico": -12.0,
  "activo": true
}
```

#### Response (404 Not Found)
```json
{
  "detail": "Sensor no encontrado"
}
```

---

### 5. **GET /lecturas** - Listar Lecturas

#### Descripción
Obtiene lecturas de sensores con filtros avanzados y estadísticas.

#### Request
```http
GET http://localhost:8001/lecturas?sensorId=SENS001&estado=normal&from=2025-11-01T00:00:00Z&to=2025-11-26T23:59:59Z&limit=100
```

#### Parámetros de Query (Opcionales)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `sensorId` | string | Filtrar por sensor específico | `SENS001` |
| `ubicacionId` | string | Filtrar por vehículo/ubicación | `VEH001` |
| `estado` | string | Estado (`normal`, `alerta`, `critico`) | `normal` |
| `cadenaRota` | boolean | Filtrar por rotura de cadena | `true` |
| `from` | ISO-8601 | Fecha inicio | `2025-11-01T00:00:00Z` |
| `to` | ISO-8601 | Fecha fin | `2025-11-26T23:59:59Z` |
| `limit` | integer | Máximo de lecturas (default: 100, max: 1000) | `100` |

#### Response (200 OK)
```json
{
  "total": 150,
  "limit": 100,
  "estadisticas": {
    "alertas": 10,
    "criticas": 2,
    "cadenas_rotas": 1,
    "porcentaje_normal": 93.33
  },
  "data": [
    {
      "id": "LECT0001",
      "sensorId": "SENS001",
      "ubicacionId": "VEH001",
      "timestamp": "2025-11-26T10:15:00.000Z",
      "temperatura": -18.2,
      "gps": {
        "latitud": 40.4168,
        "longitud": -3.7038,
        "altitud": 650.0
      },
      "estado": "normal",
      "alertaActiva": false,
      "tiempoFueraRango": 0,
      "cadenRota": false
    },
    {
      "id": "LECT0002",
      "sensorId": "SENS001",
      "ubicacionId": "VEH001",
      "timestamp": "2025-11-26T10:20:00.000Z",
      "temperatura": -13.5,
      "gps": {
        "latitud": 40.4200,
        "longitud": -3.7000,
        "altitud": 655.0
      },
      "estado": "alerta",
      "alertaActiva": true,
      "tiempoFueraRango": 5,
      "cadenRota": false
    }
  ]
}
```

---

### 6. **GET /lecturas/alertas** - Listar Alertas Activas

#### Descripción
Obtiene solo las lecturas que tienen alertas activas.

#### Request
```http
GET http://localhost:8001/lecturas/alertas
```

#### Response (200 OK)
```json
{
  "total": 8,
  "data": [
    {
      "id": "LECT0005",
      "sensorId": "SENS002",
      "ubicacionId": "VEH001",
      "timestamp": "2025-11-26T10:30:00.000Z",
      "temperatura": 11.0,
      "gps": {
        "latitud": 40.4250,
        "longitud": -3.6950,
        "altitud": 660.0
      },
      "estado": "alerta",
      "alertaActiva": true,
      "tiempoFueraRango": 15,
      "cadenRota": false
    }
  ]
}
```

---

### 7. **GET /lecturas/cadena-rota** - Listar Cadenas Rotas

#### Descripción
Obtiene lecturas donde se ha detectado rotura de cadena de frío.

#### Request
```http
GET http://localhost:8001/lecturas/cadena-rota
```

#### Response (200 OK)
```json
{
  "total": 2,
  "data": [
    {
      "id": "LECT0010",
      "sensorId": "SENS003",
      "ubicacionId": "VEH002",
      "timestamp": "2025-11-26T09:45:00.000Z",
      "temperatura": -8.0,
      "gps": {
        "latitud": 41.3851,
        "longitud": 2.1734,
        "altitud": 12.0
      },
      "estado": "critico",
      "alertaActiva": true,
      "tiempoFueraRango": 45,
      "cadenRota": true
    }
  ]
}
```

---

### 8. **GET /vehiculos** - Listar Vehículos

#### Descripción
Obtiene el listado de vehículos de la flota.

#### Request
```http
GET http://localhost:8001/vehiculos
```

#### Response (200 OK)
```json
{
  "total": 5,
  "data": [
    {
      "id": "VEH001",
      "matricula": "1234ABC",
      "modelo": "Mercedes Sprinter Refrigerado",
      "capacidad_kg": 5000,
      "proveedor_id": "PROV001",
      "latitud": 40.4168,
      "longitud": -3.7038,
      "altitud": 650.0,
      "en_ruta": true
    },
    {
      "id": "VEH002",
      "matricula": "5678DEF",
      "modelo": "Iveco Daily Congelado",
      "capacidad_kg": 3500,
      "proveedor_id": "PROV001",
      "latitud": 41.3851,
      "longitud": 2.1734,
      "altitud": 12.0,
      "en_ruta": true
    }
  ]
}
```

---

### 9. **GET /vehiculos/:vehiculo_id** - Obtener Vehículo por ID

#### Descripción
Obtiene los detalles de un vehículo específico.

#### Request
```http
GET http://localhost:8001/vehiculos/VEH001
```

#### Response (200 OK)
```json
{
  "id": "VEH001",
  "matricula": "1234ABC",
  "modelo": "Mercedes Sprinter Refrigerado",
  "capacidad_kg": 5000,
  "proveedor_id": "PROV001",
  "latitud": 40.4168,
  "longitud": -3.7038,
  "altitud": 650.0,
  "en_ruta": true
}
```

#### Response (404 Not Found)
```json
{
  "detail": "Vehículo no encontrado"
}
```

---

### 10. **GET /incidencias** - Listar Incidencias

#### Descripción
Obtiene el listado de incidencias reportadas con filtros opcionales.

#### Request
```http
GET http://localhost:8001/incidencias?gravedad=alta&resuelta=false
```

#### Parámetros de Query (Opcionales)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `vehiculoId` | string | Filtrar por vehículo | `VEH001` |
| `gravedad` | string | Gravedad (`baja`, `media`, `alta`) | `alta` |
| `resuelta` | boolean | Filtrar por estado de resolución | `false` |

#### Response (200 OK)
```json
{
  "total": 3,
  "data": [
    {
      "id": "INC001",
      "vehiculo_id": "VEH001",
      "descripcion": "Fallo en sistema de refrigeración",
      "gravedad": "alta",
      "fecha_reporte": "2025-11-26T08:30:00.000Z",
      "resuelta": false,
      "fecha_resolucion": null
    }
  ]
}
```

---

## Manejo de Errores

### Tipos de Errores

#### 1. **400 Bad Request** - Parámetros Inválidos
```json
{
  "detail": "Formato de fecha 'from' inválido. Use ISO 8601"
}
```

#### 2. **404 Not Found** - Recurso No Encontrado
```json
{
  "detail": "Sensor no encontrado"
}
```

#### 3. **500 Internal Server Error** - Error del Servidor
```json
{
  "detail": "Error interno del servidor"
}
```

---

## Estados de Lecturas

### Clasificación de Temperatura

| Estado | Descripción | Condición |
|--------|-------------|-----------|
| `normal` | Temperatura dentro del rango | `rango_min ≤ temp ≤ rango_max` |
| `alerta` | Temperatura cercana al límite | `rango_max < temp ≤ umbral_alerta` |
| `critico` | Temperatura crítica | `temp > umbral_critico` |

### Rotura de Cadena de Frío

Se considera rotura de cadena cuando:
- Estado = `critico` **Y**
- Tiempo fuera de rango > 30 minutos

---

## Variables de Entorno

Crear archivo `.env` en `/services/iot/`:

```env
PORT=8001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fresh_and_go_iot
DB_USER=postgres
DB_PASSWORD=postgres
```

---

## Instalación y Ejecución

### Instalar dependencias
```bash
cd services/iot
pip install -r requirements.txt
```

### Iniciar servicio
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

---

## Dependencias (requirements.txt)

```txt
fastapi==0.104.1
uvicorn==0.24.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
python-dateutil==2.8.2
```

---

## Base de Datos

### Tablas Principales

- **sensores**: Sensores de temperatura instalados en vehículos
- **lecturas**: Lecturas de temperatura y GPS
- **vehiculos**: Vehículos de la flota
- **incidencias**: Incidencias reportadas

### Inicialización

```bash
psql -U postgres -d fresh_and_go_iot -f database/crear_tablas.sql
psql -U postgres -d fresh_and_go_iot -f database/datos_semilla.sql
```

---

## Pruebas con Postman

Importar la colección desde:
```
/docs/postman_collection.json
```

### Tests Recomendados

1. ✅ Health Check
2. ✅ Listar sensores sin filtros
3. ✅ Listar sensores por vehículo y tipo de alimento
4. ✅ Obtener sensor específico
5. ✅ Listar lecturas con filtros de fecha y estado
6. ✅ Obtener alertas activas
7. ✅ Obtener cadenas rotas
8. ✅ Listar vehículos
9. ✅ Listar incidencias no resueltas

---

## Documentación Automática

FastAPI genera automáticamente:

### Swagger UI (OpenAPI)
```
http://localhost:8001/docs
```
- Interfaz interactiva para probar endpoints
- Documentación de parámetros y respuestas
- Ejemplos de uso

### ReDoc
```
http://localhost:8001/redoc
```
- Documentación alternativa más legible
- Navegación por secciones
- Exportación a PDF

---

## Soporte

Para más información, consultar:
- README.md del servicio
- Código fuente en `/services/iot`
- Scripts SQL en `/database`
- Documentación interactiva en `/docs`
