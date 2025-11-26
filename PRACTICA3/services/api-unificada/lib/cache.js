const NodeCache = require('node-cache');
const logger = require('./logger');

// TTL por defecto: 60 segundos
const cache = new NodeCache({ 
  stdTTL: parseInt(process.env.CACHE_TTL) || 60,
  checkperiod: 120 
});

// Eventos de caché
cache.on('set', (key, value) => {
  logger.debug(`Cache SET: ${key}`);
});

cache.on('expired', (key, value) => {
  logger.debug(`Cache EXPIRED: ${key}`);
});

cache.on('del', (key, value) => {
  logger.debug(`Cache DEL: ${key}`);
});

module.exports = cache;