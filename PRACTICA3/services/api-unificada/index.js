const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getClienteDetalle } = require('./controllers/clienteController');
const { getResumen } = require('./controllers/resumenController');
const crmClient = require('./lib/crmClient');
const iotClient = require('./lib/iotClient');
const logger = require('./lib/logger');
const cache = require('./lib/cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Crear carpeta de logs si no existe
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    query: req.query,
    params: req.params
  });
  next();
});

// ==================== HEALTH CHECK ====================

async function checkConnections() {
  logger.info('Verificando conexiones con servicios externos...');
  
  const crmHealth = await crmClient.checkHealth();
  if (crmHealth.success) {
    logger.info('✅ CRM Service: CONECTADO', crmHealth.data);
  } else {
    logger.error('❌ CRM Service: NO DISPONIBLE', { error: crmHealth.error });
  }
  
  const iotHealth = await iotClient.checkHealth();
  if (iotHealth.success) {
    logger.info('✅ IoT Service: CONECTADO', iotHealth.data);
  } else {
    logger.error('❌ IoT Service: NO DISPONIBLE', { error: iotHealth.error });
  }
}

// ==================== ENDPOINTS ====================

// Ruta principal
app.get('/', async (req, res) => {
  const crmHealth = await crmClient.checkHealth();
  const iotHealth = await iotClient.checkHealth();
  
  res.json({
    servicio: 'API Unificada Fresh&Go',
    version: '2.0.0',
    nivel: 'Nivel 2 - Completo',
    descripcion: 'Capa de integración entre CRM e IoT con PostgreSQL',
    caracteristicas: [
      'Validación de datos con JSON Schema',
      'Filtros y paginación avanzada',
      'Manejo robusto de errores',
      'Cacheo inteligente (TTL: 60s)',
      'Logging con Winston',
      'Optimización de llamadas'
    ],
    endpoints: [
      'GET / - Información del servicio',
      'GET /health - Estado de conexiones',
      'GET /cache/stats - Estadísticas de caché',
      'DELETE /cache - Limpiar caché',
      'GET /clientes/detalle/:clienteId - Detalle completo con filtros',
      'GET /resumen - Resumen general de los sistemas'
    ],
    filtros_disponibles: {
      'GET /clientes/detalle/:clienteId': [
        'sensorId - Filtrar por sensor específico',
        'tipoAlimento - congelado, refrigerado, delicado',
        'from - Fecha inicio ISO-8601',
        'to - Fecha fin ISO-8601',
        'estado - normal, alerta, critico',
        'limit - Máximo de lecturas por sensor (default: 50)',
        'page - Número de página para pedidos (default: 1)'
      ]
    },
    servicios_integrados: {
      crm: {
        url: process.env.CRM_URL || 'http://localhost:3001',
        estado: crmHealth.success ? 'conectado' : 'no_disponible',
        error: crmHealth.error || null
      },
      iot: {
        url: process.env.IOT_URL || 'http://localhost:8001',
        estado: iotHealth.success ? 'conectado' : 'no_disponible',
        error: iotHealth.error || null
      }
    },
    cache: {
      ttl: process.env.CACHE_TTL || '60 segundos',
      stats: cache.getStats()
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const crmHealth = await crmClient.checkHealth();
  const iotHealth = await iotClient.checkHealth();
  
  const allHealthy = crmHealth.success && iotHealth.success;
  const statusCode = allHealthy ? 200 : 503;
  
  res.status(statusCode).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      crm: {
        url: process.env.CRM_URL || 'http://localhost:3001',
        status: crmHealth.success ? 'up' : 'down',
        error: crmHealth.error || null,
        data: crmHealth.data || null
      },
      iot: {
        url: process.env.IOT_URL || 'http://localhost:8001',
        status: iotHealth.success ? 'up' : 'down',
        error: iotHealth.error || null,
        data: iotHealth.data || null
      }
    }
  });
});

// Cache stats endpoint
app.get('/cache/stats', (req, res) => {
  const stats = cache.getStats();
  const keys = cache.keys();
  
  res.json({
    stats: stats,
    totalKeys: keys.length,
    keys: keys,
    ttl: process.env.CACHE_TTL || 60
  });
});

// Clear cache endpoint
app.delete('/cache', (req, res) => {
  const { pattern } = req.query;
  
  if (pattern) {
    // Limpiar patrón específico
    if (pattern.startsWith('crm')) {
      crmClient.invalidateCache(pattern.replace('crm:', ''));
    } else if (pattern.startsWith('iot')) {
      iotClient.invalidateCache(pattern.replace('iot:', ''));
    }
    logger.info(`Cache invalidado con patrón: ${pattern}`);
    res.json({ message: `Cache invalidado con patrón: ${pattern}` });
  } else {
    // Limpiar todo el caché
    cache.flushAll();
    logger.info('Todo el cache ha sido limpiado');
    res.json({ message: 'Todo el cache ha sido limpiado' });
  }
});

// GET /clientes/detalle/:clienteId (con filtros Nivel 2)
app.get('/clientes/detalle/:clienteId', getClienteDetalle);

// GET /resumen
app.get('/resumen', getResumen);

// Manejo de rutas no encontradas
app.use((req, res) => {
  logger.warn(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Endpoint no encontrado',
    url: req.url,
    metodo: req.method,
    endpoints_disponibles: [
      'GET /',
      'GET /health',
      'GET /cache/stats',
      'DELETE /cache',
      'GET /clientes/detalle/:clienteId',
      'GET /resumen'
    ]
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  logger.error('Error no capturado', {
    error: err.message,
    stack: err.stack,
    url: req.url
  });
  res.status(500).json({
    error: 'Error interno del servidor',
    details: err.message
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(70));
  console.log(`✅ API Unificada Nivel 2 ejecutándose en http://localhost:${PORT}`);
  console.log('='.repeat(70));
  console.log(`📡 CRM URL: ${process.env.CRM_URL || 'http://localhost:3001'}`);
  console.log(`📡 IoT URL: ${process.env.IOT_URL || 'http://localhost:8001'}`);
  console.log(`🗄️  Cache TTL: ${process.env.CACHE_TTL || 60} segundos`);
  console.log(`📝 Log Level: ${process.env.LOG_LEVEL || 'info'}`);
  console.log('='.repeat(70) + '\n');
  
  // Verificar conexiones
  await checkConnections();
  
  console.log('\n📋 Endpoints disponibles:');
  console.log('   GET  /');
  console.log('   GET  /health');
  console.log('   GET  /cache/stats');
  console.log('   DELETE /cache');
  console.log('   GET  /clientes/detalle/:clienteId');
  console.log('   GET  /resumen');
  console.log('\n' + '='.repeat(70) + '\n');
  
  logger.info('API Unificada iniciada correctamente');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor...');
  cache.flushAll();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido. Cerrando servidor...');
  cache.flushAll();
  process.exit(0);
});
