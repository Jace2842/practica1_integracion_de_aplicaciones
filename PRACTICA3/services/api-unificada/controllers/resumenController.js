const crmClient = require('../lib/crmClient');
const iotClient = require('../lib/iotClient');
const logger = require('../lib/logger');

async function getResumen(req, res) {
  const startTime = Date.now();
  
  try {
    logger.info('[API Unificada] Solicitud de resumen general');

    // Inicializar respuesta
    const resumen = {
      timestamp: new Date().toISOString(),
      crm: {
        disponible: false,
        error: null,
        stats: {}
      },
      iot: {
        disponible: false,
        error: null,
        stats: {}
      },
      integracion: {
        estado: 'parcial',
        serviciosDisponibles: []
      }
    };

    // 1. Obtener estadísticas del CRM
    const clientesResult = await crmClient.getClientes();
    
    if (clientesResult.success) {
      resumen.crm.disponible = true;
      resumen.integracion.serviciosDisponibles.push('CRM');
      
      const clientes = clientesResult.data.data || [];
      
      const pedidosResult = await crmClient.getPedidos();
      const pedidos = pedidosResult.success ? pedidosResult.data.data || [] : [];

      resumen.crm.stats = {
        totalClientes: clientes.length,
        totalPedidos: pedidos.length,
        pedidosPendientes: pedidos.filter(p => p.estado === 'pendiente').length
      };

      logger.info('[CRM] Estadísticas obtenidas', resumen.crm.stats);
    } else {
      resumen.crm.error = clientesResult.error;
      logger.error('[CRM] No disponible', { error: clientesResult.error });
    }

    // 2. Obtener estadísticas del IoT
    const sensoresResult = await iotClient.getSensores();
    
    if (sensoresResult.success) {
      resumen.iot.disponible = true;
      resumen.integracion.serviciosDisponibles.push('IoT');
      
      const sensores = sensoresResult.data.data || [];
      
      const vehiculosResult = await iotClient.getVehiculos();
      const vehiculos = vehiculosResult.success ? vehiculosResult.data.data || [] : [];
      
      const alertasResult = await iotClient.getAlertas();
      const alertas = alertasResult.success ? alertasResult.data.data || [] : [];

      resumen.iot.stats = {
        totalSensores: sensores.length,
        totalVehiculos: vehiculos.length,
        alertasActivas: alertas.length
      };

      logger.info('[IoT] Estadísticas obtenidas', resumen.iot.stats);
    } else {
      resumen.iot.error = sensoresResult.error;
      logger.error('[IoT] No disponible', { error: sensoresResult.error });
    }

    // 3. Determinar estado general de integración
    if (resumen.crm.disponible && resumen.iot.disponible) {
      resumen.integracion.estado = 'completo';
    } else if (!resumen.crm.disponible && !resumen.iot.disponible) {
      resumen.integracion.estado = 'no_disponible';
    }

    // 4. Devolver resumen
    const statusCode = resumen.integracion.estado === 'no_disponible' ? 503 : 200;
    
    logger.info('[API Unificada] Resumen generado exitosamente', {
      estado: resumen.integracion.estado
    });

    res.status(statusCode).json(resumen);

  } catch (error) {
    logger.error('Error en getResumen', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}

module.exports = {
  getResumen
};