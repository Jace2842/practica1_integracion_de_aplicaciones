-- ============================================
-- Fresh&Go - Datos Semilla
-- ============================================

-- Limpiar datos existentes
TRUNCATE TABLE lecturas, sensores, vehiculos, productos_pedido, pedidos, conductores, proveedores, clientes RESTART IDENTITY CASCADE;

-- ============================================
-- DATOS CRM
-- ============================================

-- Clientes
INSERT INTO clientes (id, nombre, email, direccion, telefono) VALUES
('CLI001', 'Restaurante El Buen Sabor', 'pedidos@elbuensabor.com', 'Calle Mayor 45, Sevilla', '+34 954 123 456'),
('CLI002', 'Supermercado Fresh Market', 'compras@freshmarket.es', 'Avenida de la Constitución 23, Sevilla', '+34 954 234 567'),
('CLI003', 'Hotel Andalucía Palace', 'cocina@andaluciapalace.com', 'Plaza Nueva 8, Sevilla', '+34 954 345 678'),
('CLI004', 'Cafetería La Esquina', 'info@laesquina.es', 'Calle Sierpes 12, Sevilla', '+34 954 456 789'),
('CLI005', 'Panadería Los Arcos', 'ventas@losarcos.com', 'Plaza del Salvador 3, Sevilla', '+34 954 567 890');

-- Proveedores
INSERT INTO proveedores (id, nombre, contacto, email) VALUES
('PROV001', 'Frutas y Verduras Andaluzas S.L.', 'Juan García Martínez', 'ventas@frutasandaluzas.com'),
('PROV002', 'Lácteos del Sur', 'María López Fernández', 'pedidos@lactoesdelsur.es'),
('PROV003', 'Distribuciones Alimentarias Sevilla', 'Pedro Sánchez', 'info@distalisevilla.com');

-- Conductores
INSERT INTO conductores (id, nombre, email, telefono, vehiculo_asignado, licencia_conducir, disponibilidad) VALUES
('COND001', 'Carlos Martínez Ruiz', 'carlos.martinez@freshgo.com', '+34 600 111 222', 'VEH001', 'B-12345678', true),
('COND002', 'Ana Rodríguez López', 'ana.rodriguez@freshgo.com', '+34 600 333 444', 'VEH002', 'B-87654321', false),
('COND003', 'Miguel Ángel Torres', 'miguel.torres@freshgo.com', '+34 600 555 666', 'VEH003', 'B-11223344', true),
('COND004', 'Laura Jiménez Castro', 'laura.jimenez@freshgo.com', '+34 600 777 888', 'VEH004', 'B-55667788', true);

-- Pedidos
INSERT INTO pedidos (id, cliente_id, proveedor_id, estado, fecha_pedido) VALUES
('PED001', 'CLI001', 'PROV001', 'en_transito', '2025-11-20 09:00:00'),
('PED002', 'CLI002', 'PROV002', 'pendiente', '2025-11-21 10:30:00'),
('PED003', 'CLI003', 'PROV001', 'entregado', '2025-11-19 08:00:00'),
('PED004', 'CLI001', 'PROV001', 'en_transito', '2025-11-21 14:00:00'),
('PED005', 'CLI004', 'PROV002', 'pendiente', '2025-11-22 07:30:00'),
('PED006', 'CLI005', 'PROV001', 'entregado', '2025-11-18 11:00:00');

-- Productos en Pedidos
INSERT INTO productos_pedido (pedido_id, producto_id, nombre, cantidad) VALUES
('PED001', 'PROD001', 'Tomates', 50),
('PED001', 'PROD002', 'Lechugas', 30),
('PED002', 'PROD003', 'Leche', 100),
('PED002', 'PROD004', 'Yogur', 50),
('PED003', 'PROD005', 'Fresas', 20),
('PED004', 'PROD006', 'Pimientos', 40),
('PED004', 'PROD007', 'Cebollas', 35),
('PED005', 'PROD008', 'Queso', 25),
('PED006', 'PROD009', 'Naranjas', 60);

-- ============================================
-- DATOS IOT
-- ============================================

-- Vehículos
INSERT INTO vehiculos (id, matricula, capacidad_kg, gps, temperatura) VALUES
('VEH001', '1234 ABC', 1500, '37.3886,-5.9845', 2.1),
('VEH002', '5678 DEF', 2000, '37.3920,-5.9940', 1.2);

-- Sensores (ACTUALIZADO: congelado, refrigerado, delicado)
INSERT INTO sensores (id, nombre, ubicacion_id, tipo_alimento, rango_min, rango_max, umbral_alerta, umbral_critico, intervalo_lectura) VALUES
('SENS001', 'Sensor Vehículo 1 - Zona Congelados', 'VEH001', 'congelado', -22, -18, -15, -12, 300),
('SENS002', 'Sensor Vehículo 1 - Zona Refrigerados', 'VEH001', 'refrigerado', 0, 4, 4, 7, 300),
('SENS003', 'Sensor Vehículo 1 - Zona Delicados', 'VEH001', 'delicado', 0, 2, 2, 3, 180),
('SENS004', 'Sensor Vehículo 2 - Zona Congelados', 'VEH002', 'congelado', -22, -18, -15, -12, 300),
('SENS005', 'Sensor Vehículo 2 - Zona Refrigerados', 'VEH002', 'refrigerado', 0, 4, 4, 7, 300);

-- Lecturas
INSERT INTO lecturas (id, sensor_id, ubicacion_id, timestamp, temperatura, latitud, longitud, altitud, estado, alerta_activa, tiempo_fuera_rango, cadena_rota) VALUES
-- Sensor 1 (Congelados VEH001)
('LECT001', 'SENS001', 'VEH001', '2025-11-22 08:00:00', -19.5, 37.3886, -5.9845, 12, 'normal', false, 0, false),
('LECT002', 'SENS001', 'VEH001', '2025-11-22 08:05:00', -18.2, 37.3890, -5.9850, 13, 'normal', false, 0, false),
('LECT003', 'SENS001', 'VEH001', '2025-11-22 08:10:00', -14.8, 37.3895, -5.9855, 14, 'alerta', true, 5, false),
('LECT004', 'SENS001', 'VEH001', '2025-11-22 08:15:00', -11.5, 37.3900, -5.9860, 15, 'critico', true, 10, false),
('LECT005', 'SENS001', 'VEH001', '2025-11-22 08:20:00', -10.2, 37.3905, -5.9865, 16, 'critico', true, 20, true),

-- Sensor 2 (Refrigerados VEH001)
('LECT006', 'SENS002', 'VEH001', '2025-11-22 08:00:00', 2.1, 37.3886, -5.9845, 12, 'normal', false, 0, false),
('LECT007', 'SENS002', 'VEH001', '2025-11-22 08:05:00', 3.8, 37.3890, -5.9850, 13, 'normal', false, 0, false),
('LECT008', 'SENS002', 'VEH001', '2025-11-22 08:10:00', 4.5, 37.3895, -5.9855, 14, 'alerta', true, 5, false),
('LECT009', 'SENS002', 'VEH001', '2025-11-22 08:15:00', 3.2, 37.3900, -5.9860, 15, 'normal', false, 0, false),

-- Sensor 3 (Delicados VEH001)
('LECT010', 'SENS003', 'VEH001', '2025-11-22 08:00:00', 0.8, 37.3886, -5.9845, 12, 'normal', false, 0, false),
('LECT011', 'SENS003', 'VEH001', '2025-11-22 08:03:00', 1.5, 37.3890, -5.9850, 13, 'normal', false, 0, false),
('LECT012', 'SENS003', 'VEH001', '2025-11-22 08:06:00', 2.3, 37.3895, -5.9855, 14, 'alerta', true, 3, false),
('LECT013', 'SENS003', 'VEH001', '2025-11-22 08:09:00', 1.2, 37.3900, -5.9860, 15, 'normal', false, 0, false),

-- Sensor 4 (Congelados VEH002)
('LECT014', 'SENS004', 'VEH002', '2025-11-22 08:00:00', -20.1, 37.3920, -5.9940, 10, 'normal', false, 0, false),
('LECT015', 'SENS004', 'VEH002', '2025-11-22 08:10:00', -19.2, 37.3925, -5.9945, 11, 'normal', false, 0, false),

-- Sensor 5 (Refrigerados VEH002)
('LECT016', 'SENS005', 'VEH002', '2025-11-22 08:00:00', 2.5, 37.3920, -5.9940, 10, 'normal', false, 0, false),
('LECT017', 'SENS005', 'VEH002', '2025-11-22 08:10:00', 3.1, 37.3925, -5.9945, 11, 'normal', false, 0, false);

-- Verificación de datos insertados
SELECT 'Clientes insertados: ' || COUNT(*) FROM clientes;
SELECT 'Proveedores insertados: ' || COUNT(*) FROM proveedores;
SELECT 'Conductores insertados: ' || COUNT(*) FROM conductores;
SELECT 'Pedidos insertados: ' || COUNT(*) FROM pedidos;
SELECT 'Productos insertados: ' || COUNT(*) FROM productos_pedido;
SELECT 'Vehículos insertados: ' || COUNT(*) FROM vehiculos;
SELECT 'Sensores insertados: ' || COUNT(*) FROM sensores;
SELECT 'Lecturas insertadas: ' || COUNT(*) FROM lecturas;