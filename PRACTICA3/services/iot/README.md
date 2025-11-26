# IoT Service - Fresh & Go

Servicio de IoT para gestión de sensores, lecturas y vehículos del sistema Fresh & Go.

## Endpoints

- `GET /` - Información del servicio
- `GET /health` - Health check
- `GET /sensores` - Listar sensores
- `GET /sensores/:id` - Obtener sensor por ID
- `GET /lecturas` - Listar lecturas
- `GET /lecturas/:id` - Obtener lectura por ID
- `GET /vehiculos` - Listar vehículos
- `GET /vehiculos/:id` - Obtener vehículo por ID
- `GET /dashboard/resumen` - Resumen del dashboard
- `GET /tracking/:vehiculoId` - Tracking de vehículo
- `GET /alertas` - Alertas activas
- `GET /cadena-frio` - Verificación cadena de frío
- `GET /mapa/gps` - Datos GPS para mapa

## Instalación

```bash
pip install -r requirements.txt
```

## Ejecución

```bash
python main.py
```

Puerto: 8001
