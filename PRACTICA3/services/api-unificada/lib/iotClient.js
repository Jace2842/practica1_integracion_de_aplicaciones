const axios = require('axios');
const logger = require('./logger');
const cache = require('./cache');

const IOT_BASE_URL = process.env.IOT_URL || 'http://localhost:8001';
const TIMEOUT = 5000;

class IoTClient {
  constructor() {
    this.client = axios.create({
      baseURL: IOT_BASE_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getSensores(params = {}) {
    const cacheKey = `iot:sensores:${JSON.stringify(params)}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info(`[IoT Cache HIT] Sensores`, { params });
      return { success: true, data: cached, fromCache: true };
    }

    try {
      logger.info(`[IoT] GET /sensores`, { params });
      const response = await this.client.get('/sensores', { params });
      
      cache.set(cacheKey, response.data);
      
      logger.info(`[IoT] ${response.data.total || 0} sensores obtenidos`);
      return { success: true, data: response.data, fromCache: false };
    } catch (error) {
      logger.error('[IoT] Error obteniendo sensores', {
        message: error.message,
        code: error.code
      });
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status || 500,
        code: error.code
      };
    }
  }

  async getSensoresByUbicacion(ubicacionId) {
    return this.getSensores({ ubicacionId });
  }

  async getLecturas(params = {}) {
    // No cachear lecturas ya que son datos en tiempo real
    try {
      logger.info(`[IoT] GET /lecturas`, { params });
      const response = await this.client.get('/lecturas', { params });
      logger.info(`[IoT] ${response.data.total || 0} lecturas obtenidas`);
      return { success: true, data: response.data };
    } catch (error) {
      logger.error('[IoT] Error obteniendo lecturas', {
        message: error.message,
        code: error.code
      });
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status || 500,
        code: error.code
      };
    }
  }

  async getLecturasBySensor(sensorId, params = {}) {
    return this.getLecturas({ sensorId, ...params });
  }

  async getLecturasByUbicacion(ubicacionId, params = {}) {
    return this.getLecturas({ ubicacionId, ...params });
  }

  async getVehiculos() {
    const cacheKey = 'iot:vehiculos';
    
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info(`[IoT Cache HIT] Vehículos`);
      return { success: true, data: cached, fromCache: true };
    }

    try {
      logger.info(`[IoT] GET /vehiculos`);
      const response = await this.client.get('/vehiculos');
      
      cache.set(cacheKey, response.data);
      
      logger.info(`[IoT] ${response.data.data?.length || 0} vehículos obtenidos`);
      return { success: true, data: response.data, fromCache: false };
    } catch (error) {
      logger.error('[IoT] Error obteniendo vehículos', {
        message: error.message,
        code: error.code
      });
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status || 500,
        code: error.code
      };
    }
  }

  async getVehiculo(vehiculoId) {
    const cacheKey = `iot:vehiculo:${vehiculoId}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info(`[IoT Cache HIT] Vehículo ${vehiculoId}`);
      return { success: true, data: cached, fromCache: true };
    }

    try {
      logger.info(`[IoT] GET /vehiculos/${vehiculoId}`);
      const response = await this.client.get(`/vehiculos/${vehiculoId}`);
      
      cache.set(cacheKey, response.data);
      
      logger.info(`[IoT] Vehículo ${vehiculoId} obtenido`);
      return { success: true, data: response.data, fromCache: false };
    } catch (error) {
      logger.error(`[IoT] Error obteniendo vehículo ${vehiculoId}`, {
        message: error.message,
        code: error.code
      });
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status || 500,
        code: error.code
      };
    }
  }

  async getEstadoCadenaVehiculo(vehiculoId) {
    try {
      logger.info(`[IoT] GET /vehiculos/${vehiculoId}/estado-cadena`);
      const response = await this.client.get(`/vehiculos/${vehiculoId}/estado-cadena`);
      return { success: true, data: response.data };
    } catch (error) {
      logger.error(`[IoT] Error obteniendo estado cadena vehículo ${vehiculoId}`, {
        message: error.message
      });
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status || 500,
        code: error.code
      };
    }
  }

  async getAlertas() {
    try {
      logger.info(`[IoT] GET /lecturas/alertas`);
      const response = await this.client.get('/lecturas/alertas');
      return { success: true, data: response.data };
    } catch (error) {
      logger.error('[IoT] Error obteniendo alertas', {
        message: error.message
      });
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status || 500,
        code: error.code
      };
    }
  }

  async getCadenasRotas() {
    try {
      logger.info(`[IoT] GET /lecturas/cadena-rota`);
      const response = await this.client.get('/lecturas/cadena-rota');
      return { success: true, data: response.data };
    } catch (error) {
      logger.error('[IoT] Error obteniendo cadenas rotas', {
        message: error.message
      });
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status || 500,
        code: error.code
      };
    }
  }

  async checkHealth() {
    try {
      const response = await this.client.get('/health', { timeout: 2000 });
      return { success: true, message: 'IoT disponible', data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: `IoT no disponible en ${IOT_BASE_URL}: ${error.message}`,
        code: error.code
      };
    }
  }

  invalidateCache(pattern) {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.startsWith(`iot:${pattern}`));
    keysToDelete.forEach(key => cache.del(key));
    logger.info(`[Cache] Invalidados ${keysToDelete.length} registros IoT con patrón: ${pattern}`);
  }
}

module.exports = new IoTClient();