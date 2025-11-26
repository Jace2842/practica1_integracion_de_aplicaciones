-- ============================================
-- Fresh&Go - Base de Datos PostgreSQL
-- ============================================

-- Eliminar tablas si existen
DROP TABLE IF EXISTS lecturas CASCADE;
DROP TABLE IF EXISTS sensores CASCADE;
DROP TABLE IF EXISTS vehiculos CASCADE;
DROP TABLE IF EXISTS productos_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS conductores CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;

-- ============================================
-- TABLAS CRM
-- ============================================

-- Tabla de Clientes
CREATE TABLE clientes (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    direccion VARCHAR(500),
    telefono VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Proveedores
CREATE TABLE proveedores (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    contacto VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Conductores
CREATE TABLE conductores (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(50),
    vehiculo_asignado VARCHAR(50),
    licencia_conducir VARCHAR(50) NOT NULL,
    disponibilidad BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Pedidos
CREATE TABLE pedidos (
    id VARCHAR(50) PRIMARY KEY,
    cliente_id VARCHAR(50) NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    proveedor_id VARCHAR(50) NOT NULL REFERENCES proveedores(id),
    estado VARCHAR(50) NOT NULL CHECK (estado IN ('pendiente', 'en_transito', 'entregado')),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos en Pedidos
CREATE TABLE productos_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id VARCHAR(50) NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLAS IOT
-- ============================================

-- Tabla de Vehículos
CREATE TABLE vehiculos (
    id VARCHAR(50) PRIMARY KEY,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    capacidad_kg NUMERIC(10, 2),
    gps VARCHAR(100),
    temperatura NUMERIC(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Sensores
CREATE TABLE sensores (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ubicacion_id VARCHAR(50) NOT NULL REFERENCES vehiculos(id) ON DELETE CASCADE,
    tipo_alimento VARCHAR(50) NOT NULL CHECK (tipo_alimento IN ('congelado', 'refrigerado', 'delicado')),
    rango_min NUMERIC(5, 2) NOT NULL,
    rango_max NUMERIC(5, 2) NOT NULL,
    umbral_alerta NUMERIC(5, 2) NOT NULL,
    umbral_critico NUMERIC(5, 2) NOT NULL,
    intervalo_lectura INTEGER DEFAULT 300,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Lecturas
CREATE TABLE lecturas (
    id VARCHAR(50) PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL REFERENCES sensores(id) ON DELETE CASCADE,
    ubicacion_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    temperatura NUMERIC(5, 2) NOT NULL,
    latitud NUMERIC(10, 7) NOT NULL,
    longitud NUMERIC(10, 7) NOT NULL,
    altitud NUMERIC(7, 2),
    estado VARCHAR(50) NOT NULL CHECK (estado IN ('normal', 'alerta', 'critico')),
    alerta_activa BOOLEAN DEFAULT false,
    tiempo_fuera_rango INTEGER DEFAULT 0,
    cadena_rota BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_productos_pedido ON productos_pedido(pedido_id);
CREATE INDEX idx_sensores_ubicacion ON sensores(ubicacion_id);
CREATE INDEX idx_sensores_tipo_alimento ON sensores(tipo_alimento);
CREATE INDEX idx_lecturas_sensor ON lecturas(sensor_id);
CREATE INDEX idx_lecturas_ubicacion ON lecturas(ubicacion_id);
CREATE INDEX idx_lecturas_timestamp ON lecturas(timestamp);
CREATE INDEX idx_lecturas_estado ON lecturas(estado);
CREATE INDEX idx_lecturas_cadena_rota ON lecturas(cadena_rota);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON proveedores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conductores_updated_at BEFORE UPDATE ON conductores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehiculos_updated_at BEFORE UPDATE ON vehiculos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sensores_updated_at BEFORE UPDATE ON sensores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();