const crmClient = require('../lib/crmClient');
const iotClient = require('../lib/iotClient');
const { validateClienteDetalle } = require('../lib/validator');
const logger = require('../lib/logger');
const { parseISO, isAfter, isBefore } = require('date-fns');

async function getClienteDetalle(req, res) {
  const { clienteId } = req.params;
  const { 
    sensorId, 
    tipoAlimento, 
    from, 
    to, 
    estado,
    limit = 50,
    page = 1
  } = req.query;

  const startTime = Date.now();

  try {
    logger.info(`[API Unificada] Solicitud detalle cliente ${clienteId}`, {
      filters: { sensorId, tipoAlimento, from, to, estado, limit, page }
    });

    // 1. Obtener datos del cliente desde CRM
    const clienteResult = await crmClient.getCliente(clienteId);
    
    if (!clienteResult.success) {
      logger.error(`Error obteniendo cliente ${clienteId} del CRM`, {
        error: clienteResult.error
      });
      return res.status(clienteResult.status || 500).json({
        error: 'Error obteniendo datos del CRM',
        details: clienteResult.error,
        servicio: 'CRM',
        code: clienteResult.code
      });
    }

    const cliente = clienteResult.data;

    // 2. Obtener pedidos del cliente con paginación
    const pageNum = parseInt(page);
    const pageSizeNum = Math.min(parseInt(limit), 100);
    
    const pedidosResult = await crmClient.getPedidosByCliente(clienteId);
    let pedidos = pedidosResult.success ? pedidosResult.data.data || [] : [];

    // Normalizar pedidos para que cumplan con el schema
    pedidos = pedidos.map(pedido => ({
      id: pedido.id,
      clienteId: pedido.clienteId || pedido.cliente_id,
      proveedorId: pedido.proveedorId || pedido.proveedor_id,
      productos: (pedido.productos || []).map(producto => ({
        id: producto.id || producto.productoId || `PROD${Math.random().toString().substr(2, 3)}`,
        nombre: producto.nombre,
        cantidad: parseInt(producto.cantidad) || 1
      })),
      estado: pedido.estado
    }));

    // Aplicar paginación a pedidos
    const totalPedidos = pedidos.length;
    const startIdx = (pageNum - 1) * pageSizeNum;
    pedidos = pedidos.slice(startIdx, startIdx + pageSizeNum);

    // 3. Obtener IDs de proveedores de los pedidos del cliente para filtrar vehículos relacionados
    const proveedorIds = [...new Set(pedidos.map(p => p.proveedorId).filter(Boolean))];

    // 4. Obtener todos los vehículos del IoT
    const vehiculosResult = await iotClient.getVehiculos();
    
    if (!vehiculosResult.success) {
      logger.error('Error obteniendo vehículos del IoT', {
        error: vehiculosResult.error
      });
      return res.status(vehiculosResult.status || 500).json({
        error: 'Error obteniendo datos del IoT',
        details: vehiculosResult.error,
        servicio: 'IoT',
        code: vehiculosResult.code
      });
    }

    // Filtrar vehículos relacionados a los proveedores del cliente
    let vehiculos = vehiculosResult.data.data || [];
    if (proveedorIds.length > 0) {
      vehiculos = vehiculos.filter(v => proveedorIds.includes(v.proveedor_id || v.proveedorId));
    }

    // 5. Para cada vehículo relacionado, obtener sensores y lecturas con filtros
    const vehiculosEnriquecidos = [];

    for (const vehiculo of vehiculos) {
      // Obtener sensores del vehículo con filtro de tipo de alimento
      const sensoresParams = { ubicacionId: vehiculo.id };
      if (tipoAlimento) {
        sensoresParams.tipoAlimento = tipoAlimento;
      }
      
      const sensoresResult = await iotClient.getSensores(sensoresParams);
      
      if (!sensoresResult.success) {
        logger.warn(`No se pudieron obtener sensores para vehículo ${vehiculo.id}`);
        continue;
      }

      let sensores = sensoresResult.data.data || [];

      // Filtrar por sensorId específico si se proporciona
      if (sensorId) {
        sensores = sensores.filter(s => s.id === sensorId);
      }

      const sensoresConLecturas = [];

      // Para cada sensor, obtener sus lecturas con filtros
      for (const sensor of sensores) {
        const lecturasParams = { 
          sensorId: sensor.id, 
          limit: parseInt(limit) || 50 
        };
        
        // Aplicar filtros de fecha
        if (from) {
          lecturasParams.from = from;
        }
        if (to) {
          lecturasParams.to = to;
        }
        
        // Aplicar filtro de estado
        if (estado) {
          lecturasParams.estado = estado;
        }
        
        const lecturasResult = await iotClient.getLecturasBySensor(sensor.id, lecturasParams);
        
        let lecturas = lecturasResult.success ? lecturasResult.data.data || [] : [];

        // Normalizar tipoAlimento al enum del schema
        const tipoOriginal = (sensor.tipo_alimento || sensor.tipoAlimento || '').toLowerCase();
        let tipoAlimento;
        if (tipoOriginal.includes('congelado')) {
          tipoAlimento = 'congelado';
        } else if (tipoOriginal.includes('refrigerado')) {
          tipoAlimento = 'refrigerado';
        } else {
          tipoAlimento = 'delicado';
        }

        sensoresConLecturas.push({
          sensorId: sensor.id,
          nombre: sensor.nombre,
          tipoAlimento: tipoAlimento,
          rangoMin: sensor.rango_min || sensor.rangoMin,
          rangoMax: sensor.rango_max || sensor.rangoMax,
          lecturas: lecturas.map(lectura => ({
            id: lectura.id,
            timestamp: lectura.timestamp,
            temperatura: lectura.temperatura,
            gps: lectura.gps,
            estado: lectura.estado,
            alertaActiva: lectura.alertaActiva || lectura.alerta_activa || false,
            cadenRota: lectura.cadenRota || lectura.caden_rota || false
          }))
        });
      }

      // Solo agregar vehículo si tiene sensores
      if (sensoresConLecturas.length > 0) {
        vehiculosEnriquecidos.push({
          vehiculoId: vehiculo.id,
          matricula: vehiculo.matricula,
          capacidadKg: vehiculo.capacidad_kg || vehiculo.capacidadKg,
          gps: typeof vehiculo.gps === 'object' ? JSON.stringify(vehiculo.gps) : vehiculo.gps,
          sensores: sensoresConLecturas
        });
      }
    }

    // 6. Construir respuesta unificada
    const respuestaUnificada = {
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        email: cliente.email,
        direccion: cliente.direccion,
        telefono: cliente.telefono
      },
      pedidos: pedidos,
      vehiculos: vehiculosEnriquecidos,
      metadata: {
        timestamp: new Date().toISOString(),
        totalPedidos: totalPedidos,
        totalVehiculos: vehiculosEnriquecidos.length,
        totalSensores: vehiculosEnriquecidos.reduce((sum, v) => sum + v.sensores.length, 0),
        totalLecturas: vehiculosEnriquecidos.reduce((sum, v) => 
          sum + v.sensores.reduce((s, sensor) => s + sensor.lecturas.length, 0), 0
        )
      }
    };

    // 7. Validar respuesta contra JSON Schema
    const validation = validateClienteDetalle(respuestaUnificada);
    
    if (!validation.valid) {
      logger.error('Error de validación del schema', {
        errors: validation.errors
      });
      return res.status(500).json({
        error: 'La respuesta no cumple con el schema unificado',
        validationErrors: validation.errors
      });
    }

    // 8. Devolver respuesta
    logger.info(`[API Unificada] Respuesta exitosa para cliente ${clienteId}`, {
      tiempoRespuesta: `${Date.now() - startTime}ms`,
      totalDatos: {
        pedidos: pedidos.length,
        vehiculos: vehiculosEnriquecidos.length,
        sensores: respuestaUnificada.metadata.totalSensores,
        lecturas: respuestaUnificada.metadata.totalLecturas
      }
    });

    res.json(respuestaUnificada);

  } catch (error) {
    logger.error('Error en getClienteDetalle', {
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
  getClienteDetalle
};