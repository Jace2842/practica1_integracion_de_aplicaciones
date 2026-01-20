# 🚛 Fresh&Go - Sistema de Monitoreo de Cadena de Frío

**Proyecto de Integración de Aplicaciones - Tema 3**  
Sistema completo de monitoreo IoT para transporte de alimentos con integración de microservicios.

---

## 📋 Descripción del Proyecto

Fresh&Go es un sistema integral que combina tres microservicios para gestionar la cadena de frío durante el transporte de alimentos perecederos:

- **CRM Service** (Node.js + PostgreSQL): Gestión de clientes, pedidos, proveedores y conductores
- **IoT Service** (Python FastAPI + PostgreSQL): Monitoreo de temperatura, sensores y tracking GPS
- **API Unificada Nivel 2** (Node.js): Capa de integración con validación, filtros, caching y logging

### Tipos de Alimentos Monitoreados

| Tipo | Rango Óptimo | Umbral Alerta | Umbral Crítico |
|------|--------------|---------------|----------------|
| **Congelado** | -18°C a -22°C | > -15°C | > -12°C |
| **Refrigerado** | 0°C - 4°C | > 4°C | > 7°C |
| **Delicado** | 0°C - 2°C | > 2°C | > 3°C |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────┐
│  Cliente / Postman  │
└──────────┬──────────┘
           │
           ↓
┌──────────────────────────────┐
│   API Unificada (Puerto 4000)│
│   - Validación JSON Schema   │
│   - Filtros y Paginación     │
│   - Cache (60s TTL)          │
│   - Logging (Winston)        │
└─────────┬───────────┬────────┘
          │           │
     ┌────┴─┐      ┌──┴────┐
     │ CRM  │      │  IoT  │
     │:3001 │      │ :8001 │
     └───┬──┘      └───┬───┘
         │             │
         └─────┬───────┘
               │
         ┌─────┴──────┐
         │ PostgreSQL │
         │    :5432   │
         └────────────┘
```

---

## 📦 Tecnologías Utilizadas

### Backend
- **Node.js 20+** - Servicios CRM y API Unificada
- **Python 3.12** - Servicio IoT
- **PostgreSQL 16** - Base de datos relacional

### Frameworks y Librerías
#### Node.js
- Express 4.18 - Servidor HTTP
- Axios 1.6 - Cliente HTTP
- AJV 8.12 - Validación JSON Schema
- Winston 3.11 - Sistema de logging (Nivel 2)
- node-cache 5.1 - Caché en memoria (Nivel 2)
- pg 8.11 - Cliente PostgreSQL
- dotenv 16.3 - Variables de entorno

#### Python
- FastAPI 0.104 - Framework web asíncrono
- Uvicorn 0.24 - Servidor ASGI
- psycopg2-binary 2.9 - Cliente PostgreSQL
- python-dateutil 2.8 - Manejo de fechas
- python-dotenv 1.0 - Variables de entorno

---

## 🚀 Instalación y Configuración

### 1. Requisitos Previos

- Node.js 20+ instalado
- Python 3.12+ instalado
- PostgreSQL 16+ instalado y ejecutándose
- Git instalado

### 2. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/fresh-and-go.git
cd fresh-and-go
```

### 3. Configurar PostgreSQL

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE freshgo;
\c freshgo

# Salir de psql
\q

# Ejecutar el schema
psql -U postgres -d freshgo -f database/schema.sql

# Insertar datos semilla
psql -U postgres -d freshgo -f database/seed.sql
```

### 4. Configurar Servicios

#### CRM Service
```bash
cd services/crm
npm install

# Crear archivo .env
cat > .env << EOL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=freshgo
DB_USER=postgres
DB_PASSWORD=tu_contraseña
PORT=3001
EOL
```

#### IoT Service
```bash
cd ../iot
pip install -r requirements.txt

# Crear archivo .env
cat > .env << EOL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=freshgo
DB_USER=postgres
DB_PASSWORD=tu_contraseña
PORT=8001
EOL
```

#### API Unificada
```bash
cd ../api-unificada
npm install

# Crear archivo .env
cat > .env << EOL
PORT=4000
CRM_URL=http://localhost:3001
IOT_URL=http://localhost:8001
CACHE_TTL=60
LOG_LEVEL=info
EOL
```

---

## ▶️ Ejecutar los Servicios

### Terminal 1 - CRM Service
```bash
cd services/crm
npm run dev
# ✅ CRM Service ejecutándose en http://localhost:3001
```

### Terminal 2 - IoT Service
```bash
cd services/iot
uvicorn main:app --reload --port 8001
# ✅ IoT Service ejecutándose en http://localhost:8001
```

### Terminal 3 - API Unificada
```bash
cd services/api-unificada
npm run dev
# ✅ API Unificada ejecutándose en http://localhost:4000
```

---

## 🧪 Pruebas con cURL

### Verificar Health Checks
```bash
# CRM
curl http://localhost:3001/health

# IoT
curl http://localhost:8001/health

# API Unificada
curl http://localhost:4000/health
```

### Probar Endpoints

#### CRM - Obtener Clientes
```bash
curl http://localhost:3001/clientes
```

#### IoT - Obtener Sensores
```bash
curl http://localhost:8001/sensores
```

#### API Unificada - Detalle Cliente (Sin filtros)
```bash
curl http://localhost:4000/clientes/detalle/CLI001
```

#### API Unificada - Detalle Cliente (Con filtros Nivel 2)
```bash
# Filtrar por tipo de alimento delicado
curl "http://localhost:4000/clientes/detalle/CLI001?tipoAlimento=delicado"

# Filtrar por rango de fechas
curl "http://localhost:4000/clientes/detalle/CLI001?from=2025-11-22T08:00:00Z&to=2025-11-22T09:00:00Z"

# Filtrar por estado crítico
curl "http://localhost:4000/clientes/detalle/CLI001?estado=critico"

# Limitar lecturas y paginar pedidos
curl "http://localhost:4000/clientes/detalle/CLI001?limit=10&page=1"

# Combinación de filtros
curl "http://localhost:4000/clientes/detalle/CLI001?tipoAlimento=refrigerado&estado=alerta&limit=20"
```

#### API Unificada - Resumen General
```bash
curl http://localhost:4000/resumen
```

#### API Unificada - Estadísticas de Caché (Nivel 2)
```bash
curl http://localhost:4000/cache/stats
```

#### API Unificada - Limpiar Caché (Nivel 2)
```bash
curl -X DELETE http://localhost:4000/cache
```

---

## 📁 Estructura del Proyecto

```
fresh-and-go/
│
├── database/                           # Scripts SQL PostgreSQL
│   ├── schema.sql                     # Esquema completo de tablas
│   ├── seed.sql                       # Datos de prueba
│   └── README.md                      # Instrucciones de BD
│
├── services/                          
│   │
│   ├── crm/                          # Servicio CRM (Node.js)
│   │   ├── index.js                  # Servidor Express
│   │   ├── db.js                     # Conexión PostgreSQL
│   │   ├── package.json              
│   │   ├── .env                      # Variables de entorno
│   │   └── README.md                 
│   │
│   ├── iot/                          # Servicio IoT (Python)
│   │   ├── main.py                   # Servidor FastAPI
│   │   ├── db.py                     # Conexión PostgreSQL
│   │   ├── requirements.txt          
│   │   ├── .env                      
│   │   ├── data/                     # Datos JSON (deprecated)
│   │   └── README.md                 
│   │
│   └── api-unificada/                # API Unificada Nivel 2
│       ├── index.js                  # Servidor principal
│       ├── package.json              
│       ├── .env                      
│       │
│       ├── controllers/              # Lógica de negocio
│       │   ├── clienteController.js  
│       │   └── resumenController.js  
│       │
│       ├── lib/                      # Utilidades
│       │   ├── crmClient.js         # Cliente HTTP CRM
│       │   ├── iotClient.js         # Cliente HTTP IoT
│       │   ├── validator.js         # Validación JSON Schema
│       │   ├── logger.js            # Winston logging (Nivel 2)
│       │   └── cache.js             # node-cache (Nivel 2)
│       │
│       ├── schemas/                  # JSON Schemas
│       │   └── cliente-detalle.schema.json
│       │
│       ├── logs/                     # Logs generados
│       │   ├── error.log
│       │   └── combined.log
│       │
│       └── README.md                 
│
├── schemas/                           # Schemas compartidos
│   ├── cliente.schema.json
│   ├── pedido.schema.json
│   ├── sensor.schema.json
│   ├── lectura.schema.json
│   └── ...
│
├── docs/                              # Documentación
│   ├── API_ENDPOINTS.md              # Documentación CRM/IoT
│   ├── api-unificada-contratos.md    # Contratos API Unificada
│   ├── postman_collection.json       # Colección Postman
│   ├── QUICK_START.md                # Guía rápida
│   └── README.md                     
│
├── .gitignore                         
└── README.md                          # Este archivo
```

---

## 📡 Endpoints Principales

### CRM Service (Puerto 3001)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/clientes` | Lista todos los clientes (con paginación) |
| GET | `/clientes/:id` | Obtiene un cliente específico |
| GET | `/pedidos` | Lista todos los pedidos (con filtros) |
| GET | `/pedidos/:id` | Obtiene un pedido específico |
| GET | `/proveedores` | Lista todos los proveedores |
| GET | `/conductores` | Lista todos los conductores |
| GET | `/health` | Estado del servicio y BD |

### IoT Service (Puerto 8001)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/sensores` | Lista sensores (filtro por ubicación/tipo) |
| GET | `/lecturas` | Lecturas con filtros avanzados |
| GET | `/lecturas/alertas` | Solo lecturas con alertas activas |
| GET | `/lecturas/cadena-rota` | Lecturas con cadena rota |
| GET | `/vehiculos` | Lista todos los vehículos |
| GET | `/vehiculos/:id/estado-cadena` | Estado completo de cadena por vehículo |
| GET | `/dashboard/resumen` | Resumen estadístico IoT |
| GET | `/health` | Estado del servicio y BD |
| GET | `/docs` | Documentación Swagger automática |

### API Unificada (Puerto 4000) - Nivel 2

| Método | Endpoint | Descripción | Filtros Disponibles |
|--------|----------|-------------|---------------------|
| GET | `/` | Información del servicio | - |
| GET | `/health` | Estado de conexiones CRM/IoT | - |
| GET | `/cache/stats` | Estadísticas de caché | - |
| DELETE | `/cache` | Limpiar caché | `?pattern=crm:clientes` |
| GET | `/clientes/detalle/:id` | **Detalle completo unificado** | `sensorId`, `tipoAlimento`, `from`, `to`, `estado`, `limit`, `page` |
| GET | `/resumen` | Resumen general CRM + IoT | - |

---

## 🎯 Funcionalidades Nivel 2 Implementadas

### ✅ Validación de Datos
- JSON Schema validation con AJV
- Validación automática antes de responder
- Errores detallados de validación

### ✅ Filtros Avanzados

#### Filtrar por Sensor Específico
```bash
curl "http://localhost:4000/clientes/detalle/CLI001?sensorId=SENS003"
```

#### Filtrar por Tipo de Alimento
```bash
curl "http://localhost:4000/clientes/detalle/CLI001?tipoAlimento=congelado"
curl "http://localhost:4000/clientes/detalle/CLI001?tipoAlimento=refrigerado"
curl "http://localhost:4000/clientes/detalle/CLI001?tipoAlimento=delicado"
```

#### Filtrar por Rango de Fechas
```bash
curl "http://localhost:4000/clientes/detalle/CLI001?from=2025-11-22T08:00:00Z&to=2025-11-22T09:00:00Z"
```

#### Filtrar por Estado de Lectura
```bash
curl "http://localhost:4000/clientes/detalle/CLI001?estado=normal"
curl "http://localhost:4000/clientes/detalle/CLI001?estado=alerta"
curl "http://localhost:4000/clientes/detalle/CLI001?estado=critico"
```

### ✅ Paginación
```bash
# Limitar número de lecturas por sensor
curl "http://localhost:4000/clientes/detalle/CLI001?limit=10"

# Paginar pedidos
curl "http://localhost:4000/clientes/detalle/CLI001?page=2&limit=25"
```

### ✅ Manejo Robusto de Errores
- Try-catch en todos los endpoints
- Logging de errores con Winston
- Mensajes de error descriptivos
- Códigos HTTP correctos

### ✅ Caché Inteligente (Nivel 2)
- TTL configurable (default: 60s)
- Cache de clientes, pedidos, sensores, vehículos
- NO cachea lecturas (datos en tiempo real)
- Endpoint para ver estadísticas de caché
- Endpoint para limpiar caché

### ✅ Logging Profesional (Nivel 2)
- Winston logger con niveles configurables
- Logs a archivo (`logs/combined.log`, `logs/error.log`)
- Logs a consola con colores
- Formato JSON estructurado
- Timestamps automáticos

---

## 📊 Base de Datos PostgreSQL

### Tablas Principales

#### CRM
- `clientes` - Información de clientes
- `pedidos` - Pedidos realizados
- `productos_pedido` - Detalle de productos
- `proveedores` - Proveedores de alimentos
- `conductores` - Conductores asignados

#### IoT
- `vehiculos` - Vehículos de transporte
- `sensores` - Sensores de temperatura
- `lecturas` - Lecturas de temperatura y GPS

### Relaciones
```
clientes 1:N pedidos
pedidos 1:N productos_pedido
vehiculos 1:N sensores
sensores 1:N lecturas
```

---

## 🔍 Consultas Útiles PostgreSQL

```sql
-- Ver total de datos
SELECT 
  (SELECT COUNT(*) FROM clientes) as clientes,
  (SELECT COUNT(*) FROM pedidos) as pedidos,
  (SELECT COUNT(*) FROM sensores) as sensores,
  (SELECT COUNT(*) FROM lecturas) as lecturas;

-- Lecturas con alerta por vehículo
SELECT v.matricula, COUNT(*) as total_alertas
FROM lecturas l
JOIN sensores s ON l.sensor_id = s.id
JOIN vehiculos v ON s.ubicacion_id = v.id
WHERE l.alerta_activa = true
GROUP BY v.matricula;

-- Cadenas de frío rotas
SELECT s.nombre, COUNT(*) as veces_rota
FROM lecturas l
JOIN sensores s ON l.sensor_id = s.id
WHERE l.cadena_rota = true
GROUP BY s.nombre;
```

---

## 📝 Logs y Monitoreo

### Ver Logs de API Unificada
```bash
# Ver todos los logs
tail -f services/api-unificada/logs/combined.log

# Ver solo errores
tail -f services/api-unificada/logs/error.log

# Buscar logs específicos
grep "ERROR" services/api-unificada/logs/combined.log
```

### Monitorear Caché
```bash
# Ver estadísticas
curl http://localhost:4000/cache/stats | jq

# Limpiar caché de CRM
curl -X DELETE "http://localhost:4000/cache?pattern=crm"

# Limpiar todo el caché
curl -X DELETE http://localhost:4000/cache
```

---

## 🧪 Testing con Postman

1. Importar colecciones desde `/docs/postman_collection.json` y `/docs/postman_api_unificada.json`
2. Configurar variables de entorno:
   - `CRM_URL`: http://localhost:3001
   - `IOT_URL`: http://localhost:8001
   - `API_UNIFICADA_URL`: http://localhost:4000
3. Ejecutar los tests en orden

---

## 🐛 Troubleshooting

### Error: "ECONNREFUSED localhost:5432"
**Solución**: PostgreSQL no está ejecutándose
```bash
# Windows
net start postgresql-x64-16

# Linux/Mac
sudo service postgresql start
```

### Error: "password authentication failed"
**Solución**: Verificar contraseña en archivos `.env`

### Error: "relation 'clientes' does not exist"
**Solución**: Ejecutar el schema SQL
```bash
psql -U postgres -d freshgo -f database/schema.sql
psql -U postgres -d freshgo -f database/seed.sql
```

### Error: "ECONNREFUSED localhost:3001"
**Solución**: CRM Service no está ejecutándose
```bash
cd services/crm
npm run dev
```

### Error: "ECONNREFUSED localhost:8001"
**Solución**: IoT Service no está ejecutándose
```bash
cd services/iot
uvicorn main:app --reload --port 8001
```

---

## 📚 Documentación Adicional

- [API Endpoints Detallados](docs/API_ENDPOINTS.md)
- [Contratos API Unificada](docs/api-unificada-contratos.md)
- [Guía Rápida](docs/QUICK_START.md)
- [Configuración PostgreSQL](database/README.md)

---

## 👥 Autor

**Jesús** - Integración de Aplicaciones  
Universidad/Institución  
Fecha: Noviembre 2025

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico para la asignatura de Integración de Aplicaciones.

---

## ✅ Checklist de Requisitos

### Nivel 1
- [x] Crear carpeta `/services/api-unificada`
- [x] Definir JSON Schema unificado
- [x] Implementar endpoints GET `/clientes/detalle` y GET `/resumen`
- [x] Conectar con CRM e IoT
- [x] Manejar errores de conexión
- [x] Validar respuesta con JSON Schema
- [x] Documentar en `/docs/api-unificada-contratos.md`
- [x] Exportar colección Postman

### Nivel 2
- [x] Validar datos de CRM e IoT usando JSON Schema
- [x] Añadir filtros en endpoints combinados (`sensorId`, `tipoAlimento`, `from`, `to`, `estado`)
- [x] Implementar paginación (`limit`, `page`)
- [x] Manejo robusto de errores cuando CRM o IoT no responden
- [x] Caché con node-cache (TTL: 60s)
- [x] Logging con Winston (archivos y consola)
- [x] PostgreSQL como base de datos principal
- [x] Tipos de alimentos: congelado, refrigerado, delicado

---

**¡Proyecto Fresh&Go - Sistema completo de monitoreo de cadena de frío! 🚛❄️**
