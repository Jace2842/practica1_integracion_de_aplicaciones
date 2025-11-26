# API Unificada - Fresh & Go

Servicio de API unificada que integra los servicios CRM e IoT del sistema Fresh & Go. Proporciona endpoints consolidados que combinan información de múltiples fuentes.

## 🎯 Características

- ✅ Integración transparente entre CRM e IoT
- ✅ Sistema de caché inteligente con TTL
- ✅ Validación de datos con JSON Schema
- ✅ Logging profesional con Winston
- ✅ Manejo robusto de errores
- ✅ Modo degradado cuando servicios no disponibles
- ✅ Paginación y filtrado avanzado

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+
- npm
- Servicios CRM e IoT en ejecución

### Instalación

```bash
cd services/api-unificada
npm install
```

### Configuración

Copiar `.env.example` a `.env` y ajustar variables:

```env
PORT=4000
CRM_SERVICE_URL=http://localhost:3001
IOT_SERVICE_URL=http://localhost:8001
LOG_LEVEL=debug
```

### Ejecución

```bash
# Modo producción
npm start

# Modo desarrollo (con nodemon)
npm run dev
```

La API estará disponible en `http://localhost:4000`

## 📚 Endpoints

### GET /
Información del servicio y endpoints disponibles

### GET /health
Health check del servicio

### GET /clientes/detalle/:clienteId
Obtiene información detallada de un cliente incluyendo:
- Datos del cliente (CRM)
- Pedidos del cliente (CRM)
- Vehículos asignados (IoT)
- Sensores de los vehículos (IoT)
- Lecturas de los sensores (IoT)

**Parámetros de query:**
- `sensorId` - Filtrar por sensor específico
- `tipoAlimento` - Filtrar por tipo de alimento
- `from` - Fecha inicio (ISO 8601)
- `to` - Fecha fin (ISO 8601)
- `estado` - Estado del pedido
- `page` - Página (default: 1)
- `limit` - Resultados por página (default: 10)

**Ejemplo:**
```bash
GET /clientes/detalle/CLI001?tipoAlimento=carne&page=1&limit=5
```

### GET /resumen
Obtiene resumen consolidado del sistema:
- Estadísticas de CRM (clientes, pedidos, proveedores, conductores)
- Estadísticas de IoT (vehículos, sensores, dashboard)
- Estado de servicios

### GET /cache/stats
Obtiene estadísticas del sistema de caché

### DELETE /cache
Limpia el caché completo

## 🏗️ Arquitectura

```
api-unificada/
├── lib/
│   ├── logger.js          # Configuración Winston
│   ├── cache.js           # Sistema de caché con node-cache
│   ├── crmClient.js       # Cliente HTTP para CRM
│   ├── iotClient.js       # Cliente HTTP para IoT
│   └── validator.js       # Validación JSON Schema
├── controllers/
│   ├── clienteController.js    # Lógica de clientes
│   └── resumenController.js    # Lógica de resumen
├── schemas/
│   └── cliente-detalle.schema.json  # Schema de validación
├── logs/                  # Archivos de log
├── index.js              # Servidor Express
├── package.json
└── .env
```

## 🔧 Tecnologías

- **Express** - Framework web
- **Axios** - Cliente HTTP
- **Winston** - Logging profesional
- **node-cache** - Sistema de caché en memoria
- **AJV** - Validación JSON Schema
- **CORS** - Cross-Origin Resource Sharing

## 🛡️ Manejo de Errores

La API implementa varios niveles de manejo de errores:

1. **Errores de validación** (400): Datos inválidos según JSON Schema
2. **Errores de no encontrado** (404): Recurso no existe
3. **Errores de servicio** (500): Errores internos
4. **Servicios no disponibles** (503): CRM o IoT caídos

### Modo Degradado

Cuando un servicio externo no está disponible:
- La API continúa funcionando con datos parciales
- Retorna información del servicio que funciona
- Indica qué servicios están activos en `metadata.services`

## 📊 Sistema de Caché

- **TTL por defecto**: 5 minutos
- **Invalidación**: Automática por expiración
- **Llaves**: Basadas en endpoint y parámetros
- **Gestión**: Endpoints para ver stats y limpiar

## 🔍 Logging

Los logs se guardan en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores

Niveles de log: error, warn, info, debug

## 🧪 Validación

Todas las respuestas son validadas contra JSON Schemas para garantizar:
- Estructura correcta
- Tipos de datos válidos
- Campos requeridos presentes
- Formatos correctos (fechas, UUIDs, etc.)

## 📝 Documentación Completa

Ver `docs/api-unificada-contratos.md` para documentación detallada de contratos API.

## 🐛 Troubleshooting

### Servicios no responden
Verificar que CRM (puerto 3001) e IoT (puerto 8001) estén activos:
```bash
curl http://localhost:3001/health
curl http://localhost:8001/health
```

### Errores de caché
Limpiar caché manualmente:
```bash
curl -X DELETE http://localhost:4000/cache
```

### Ver logs en tiempo real
```bash
tail -f logs/combined.log
```
