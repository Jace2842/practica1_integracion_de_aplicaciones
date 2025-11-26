const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==================== CLIENTES ====================

// GET /clientes
app.get('/clientes', async (req, res) => {
  try {
    const { q, page = 1, pageSize = 25 } = req.query;
    
    const pageNum = parseInt(page);
    const pageSizeNum = Math.min(parseInt(pageSize), 100);
    
    if (isNaN(pageNum) || pageNum < 1 || isNaN(pageSizeNum) || pageSizeNum < 1) {
      return res.status(400).json({ error: 'Parámetros de paginación inválidos' });
    }
    
    const offset = (pageNum - 1) * pageSizeNum;
    
    let countQuery = 'SELECT COUNT(*) FROM clientes';
    let dataQuery = 'SELECT * FROM clientes';
    const params = [];
    
    // Filtrar por búsqueda
    if (q) {
      const searchCondition = ' WHERE LOWER(nombre) LIKE $1 OR LOWER(email) LIKE $1';
      countQuery += searchCondition;
      dataQuery += searchCondition;
      params.push(`%${q.toLowerCase()}%`);
    }
    
    // Ordenar y paginar
    dataQuery += ' ORDER BY nombre LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(pageSizeNum, offset);
    
    const countResult = await db.query(countQuery, q ? [`%${q.toLowerCase()}%`] : []);
    const total = parseInt(countResult.rows[0].count);
    
    const dataResult = await db.query(dataQuery, params);
    
    res.json({
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      data: dataResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// GET /clientes/:id
app.get('/clientes/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM clientes WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// ==================== PEDIDOS ====================

// GET /pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const { clienteId, estado, page = 1, pageSize = 25 } = req.query;
    
    const pageNum = parseInt(page);
    const pageSizeNum = Math.min(parseInt(pageSize), 100);
    
    if (isNaN(pageNum) || pageNum < 1 || isNaN(pageSizeNum) || pageSizeNum < 1) {
      return res.status(400).json({ error: 'Parámetros de paginación inválidos' });
    }
    
    const offset = (pageNum - 1) * pageSizeNum;
    
    let countQuery = 'SELECT COUNT(*) FROM pedidos';
    let dataQuery = `
      SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', pp.producto_id,
              'nombre', pp.nombre,
              'cantidad', pp.cantidad
            )
          ) FILTER (WHERE pp.id IS NOT NULL), 
          '[]'
        ) as productos
      FROM pedidos p
      LEFT JOIN productos_pedido pp ON p.id = pp.pedido_id
    `;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (clienteId) {
      conditions.push(`p.cliente_id = $${paramIndex}`);
      params.push(clienteId);
      paramIndex++;
    }
    
    if (estado) {
      conditions.push(`p.estado = $${paramIndex}`);
      params.push(estado);
      paramIndex++;
    }
    
    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      countQuery += whereClause.replace('p.', '');
      dataQuery += whereClause;
    }
    
    dataQuery += ' GROUP BY p.id ORDER BY p.fecha_pedido DESC';
    dataQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSizeNum, offset);
    
    const countParams = params.slice(0, paramIndex - 1);
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    const dataResult = await db.query(dataQuery, params);
    
    // Formatear respuesta
    const pedidos = dataResult.rows.map(row => ({
      id: row.id,
      clienteId: row.cliente_id,
      proveedorId: row.proveedor_id,
      estado: row.estado,
      fechaPedido: row.fecha_pedido,
      fechaEntrega: row.fecha_entrega,
      productos: row.productos || []
    }));
    
    res.json({
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      data: pedidos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// GET /pedidos/:id
app.get('/pedidos/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', pp.producto_id,
              'nombre', pp.nombre,
              'cantidad', pp.cantidad
            )
          ) FILTER (WHERE pp.id IS NOT NULL), 
          '[]'
        ) as productos
      FROM pedidos p
      LEFT JOIN productos_pedido pp ON p.id = pp.pedido_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    const row = result.rows[0];
    const pedido = {
      id: row.id,
      clienteId: row.cliente_id,
      proveedorId: row.proveedor_id,
      estado: row.estado,
      fechaPedido: row.fecha_pedido,
      fechaEntrega: row.fecha_entrega,
      productos: row.productos || []
    };
    
    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// ==================== PROVEEDORES ====================

app.get('/proveedores', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM proveedores ORDER BY nombre');
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

app.get('/proveedores/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM proveedores WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// ==================== CONDUCTORES ====================

app.get('/conductores', async (req, res) => {
  try {
    const { disponibilidad } = req.query;
    
    let query = 'SELECT * FROM conductores';
    const params = [];
    
    if (disponibilidad !== undefined) {
      query += ' WHERE disponibilidad = $1';
      params.push(disponibilidad === 'true');
    }
    
    query += ' ORDER BY nombre';
    
    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

app.get('/conductores/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM conductores WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// ==================== RUTA RAÍZ ====================

app.get('/', (req, res) => {
  res.json({
    servicio: 'CRM Fresh&Go',
    version: '2.0.0',
    database: 'PostgreSQL',
    endpoints: [
      'GET /clientes',
      'GET /clientes/:id',
      'GET /pedidos',
      'GET /pedidos/:id',
      'GET /proveedores',
      'GET /proveedores/:id',
      'GET /conductores',
      'GET /conductores/:id',
      'GET /health'
    ]
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected', 
      error: error.message 
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    details: err.message
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(60));
  console.log(`✅ CRM Service ejecutándose en http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log(`🗄️  Base de datos: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log('='.repeat(60) + '\n');
  
  // Verificar conexión a BD
  try {
    const result = await db.query('SELECT COUNT(*) FROM clientes');
    console.log(`✅ Conexión a PostgreSQL exitosa`);
    console.log(`📊 Clientes en BD: ${result.rows[0].count}\n`);
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    console.error('   Verifica tu archivo .env y que PostgreSQL esté ejecutándose\n');
  }
});