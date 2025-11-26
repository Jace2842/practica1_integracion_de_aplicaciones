const axios = require('axios');
const logger = require('./logger');
const cache = require('./cache');

const CRM_BASE_URL = process.env.CRM_URL || 'http://localhost:3001';
const TIMEOUT = 5000;

class CRMClient {
  constructor() {
    this.client = axios.create({
      baseURL: CRM_BASE_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getCliente(clienteId) {
    const cacheKey = `crm:cliente:${clienteId}`;
    
    // Intentar obtener de caché
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info(`[CRM Cache HIT] Cliente ${clienteId}`);
      return { success: true, data: cached, fromCache: true };
    }

    try {
      logger.info(`[CRM] GET /clientes/${clienteId}`);
      const response = await this.client.get(`/clientes/${clienteId}`);
      
      // Guardar en caché
      cache.set(cacheKey, response.data);
      
      logger.info(`[CRM] Cliente ${clienteId} obtenido exitosamente`);
      return { success: true, data: response.data, fromCache: false };
    } catch (error) {
      logger.error(`[CRM] Error obteniendo cliente ${clienteId}`, {
        message: error.message,
        code: error.code,
        status: error.response?.status
      });
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status || 500,
        code: error.code
      };
    }
  }

  async getClientes(query = {}) {
    try {
      logger.info(`[CRM] GET /clientes`, { query });
      const response = await this.client.get('/clientes', { params: query });
      logger.info(`[CRM] ${response.data.total || 0} clientes obtenidos`);
      return { success: true, data: response.data };
    } catch (error) {
      logger.error('[CRM] Error obteniendo clientes', {
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

  async getPedidos(params = {}) {
    const cacheKey = `crm:pedidos:${JSON.stringify(params)}`;
    
    // Intentar obtener de caché
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info(`[CRM Cache HIT] Pedidos`, { params });
      return { success: true, data: cached, fromCache: true };
    }

    try {
      logger.info(`[CRM] GET /pedidos`, { params });
      const response = await this.client.get('/pedidos', { params });
      
      // Guardar en caché
      cache.set(cacheKey, response.data);
      
      logger.info(`[CRM] ${response.data.total || 0} pedidos obtenidos`);
      return { success: true, data: response.data, fromCache: false };
    } catch (error) {
      logger.error('[CRM] Error obteniendo pedidos', {
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

  async getPedidosByCliente(clienteId) {
    return this.getPedidos({ clienteId });
  }

  async getProveedores() {
    const cacheKey = 'crm:proveedores';
    
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info(`[CRM Cache HIT] Proveedores`);
      return { success: true, data: cached, fromCache: true };
    }

    try {
      logger.info(`[CRM] GET /proveedores`);
      const response = await this.client.get('/proveedores');
      
      cache.set(cacheKey, response.data);
      
      logger.info(`[CRM] ${response.data.data?.length || 0} proveedores obtenidos`);
      return { success: true, data: response.data, fromCache: false };
    } catch (error) {
      logger.error('[CRM] Error obteniendo proveedores', {
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

  async getConductores() {
    const cacheKey = 'crm:conductores';
    
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info(`[CRM Cache HIT] Conductores`);
      return { success: true, data: cached, fromCache: true };
    }

    try {
      logger.info(`[CRM] GET /conductores`);
      const response = await this.client.get('/conductores');
      
      cache.set(cacheKey, response.data);
      
      logger.info(`[CRM] ${response.data.data?.length || 0} conductores obtenidos`);
      return { success: true, data: response.data, fromCache: false };
    } catch (error) {
      logger.error('[CRM] Error obteniendo conductores', {
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
      return { success: true, message: 'CRM disponible', data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: `CRM no disponible en ${CRM_BASE_URL}: ${error.message}`,
        code: error.code
      };
    }
  }

  invalidateCache(pattern) {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.startsWith(`crm:${pattern}`));
    keysToDelete.forEach(key => cache.del(key));
    logger.info(`[Cache] Invalidados ${keysToDelete.length} registros CRM con patrón: ${pattern}`);
  }
}

module.exports = new CRMClient();