from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime
from dateutil import parser as date_parser
import os
from dotenv import load_dotenv
import db

load_dotenv()

app = FastAPI(
    title="IoT Fresh&Go - Monitoreo Temperatura",
    version="2.0.0",
    description="Sistema de monitoreo de temperatura y GPS con PostgreSQL"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Evento de startup para inicializar conexión a BD
@app.on_event("startup")
async def startup_event():
    try:
        db.init_pool()
        print("✅ Conexión a PostgreSQL inicializada")
    except Exception as e:
        print(f"❌ Error al conectar con PostgreSQL: {e}")
        print("⚠️  El servicio continuará pero las consultas a BD fallarán")

# ==================== SENSORES ====================

@app.get("/sensores")
async def get_sensores(
    ubicacionId: Optional[str] = None,
    tipoAlimento: Optional[str] = Query(
        None, 
        description="Filtrar por tipo de alimento: congelado, refrigerado, delicado"
    )
):
    """Obtener listado de sensores"""
    try:
        sql = "SELECT * FROM sensores WHERE activo = true"
        params = []
        
        if ubicacionId:
            sql += " AND ubicacion_id = %s"
            params.append(ubicacionId)
        
        if tipoAlimento:
            sql += " AND tipo_alimento = %s"
            params.append(tipoAlimento)
        
        sql += " ORDER BY nombre"
        
        sensores = db.query(sql, params if params else None)
        
        return {
            "total": len(sensores),
            "data": [dict(s) for s in sensores]
        }
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/sensores/{sensor_id}")
async def get_sensor(sensor_id: str):
    """Obtener un sensor específico por ID"""
    try:
        sensor = db.query_one(
            "SELECT * FROM sensores WHERE id = %s",
            (sensor_id,)
        )
        
        if not sensor:
            raise HTTPException(status_code=404, detail="Sensor no encontrado")
        
        return dict(sensor)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== LECTURAS ====================

@app.get("/lecturas")
async def get_lecturas(
    sensorId: Optional[str] = None,
    ubicacionId: Optional[str] = None,
    estado: Optional[str] = Query(None, description="normal, alerta, critico"),
    cadenaRota: Optional[bool] = Query(None, description="Filtrar por rotura de cadena"),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    limit: int = Query(100, ge=1, le=1000)
):
    """Obtener lecturas de temperatura con filtros"""
    try:
        sql = "SELECT * FROM lecturas WHERE 1=1"
        params = []
        
        if sensorId:
            sql += " AND sensor_id = %s"
            params.append(sensorId)
        
        if ubicacionId:
            sql += " AND ubicacion_id = %s"
            params.append(ubicacionId)
        
        if estado:
            sql += " AND estado = %s"
            params.append(estado)
        
        if cadenaRota is not None:
            sql += " AND cadena_rota = %s"
            params.append(cadenaRota)
        
        # Filtrar por fechas
        if from_date:
            try:
                from_dt = date_parser.isoparse(from_date)
                sql += " AND timestamp >= %s"
                params.append(from_dt)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Formato de fecha 'from' inválido. Use ISO 8601"
                )
        
        if to_date:
            try:
                to_dt = date_parser.isoparse(to_date)
                sql += " AND timestamp <= %s"
                params.append(to_dt)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Formato de fecha 'to' inválido. Use ISO 8601"
                )
        
        # Validar que from < to
        if from_date and to_date:
            from_dt = date_parser.isoparse(from_date)
            to_dt = date_parser.isoparse(to_date)
            if from_dt > to_dt:
                raise HTTPException(
                    status_code=400,
                    detail="La fecha 'from' debe ser anterior a 'to'"
                )
        
        sql += " ORDER BY timestamp DESC LIMIT %s"
        params.append(limit)
        
        lecturas = db.query(sql, params if params else None)
        
        # Formatear respuesta
        lecturas_formateadas = []
        for l in lecturas:
            lecturas_formateadas.append({
                "id": l['id'],
                "sensorId": l['sensor_id'],
                "ubicacionId": l['ubicacion_id'],
                "timestamp": l['timestamp'].isoformat() if l['timestamp'] else None,
                "temperatura": float(l['temperatura']) if l['temperatura'] else None,
                "gps": {
                    "latitud": float(l['latitud']) if l['latitud'] else None,
                    "longitud": float(l['longitud']) if l['longitud'] else None,
                    "altitud": float(l['altitud']) if l['altitud'] else None
                },
                "estado": l['estado'],
                "alertaActiva": l['alerta_activa'],
                "tiempoFueraRango": l['tiempo_fuera_rango'],
                "cadenRota": l['cadena_rota']
            })
        
        # Estadísticas
        total = len(lecturas_formateadas)
        alertas = len([l for l in lecturas_formateadas if l['estado'] in ['alerta', 'critico']])
        criticas = len([l for l in lecturas_formateadas if l['estado'] == 'critico'])
        cadenas_rotas = len([l for l in lecturas_formateadas if l['cadenRota']])
        
        return {
            "total": total,
            "limit": limit,
            "estadisticas": {
                "alertas": alertas,
                "criticas": criticas,
                "cadenas_rotas": cadenas_rotas,
                "porcentaje_normal": round((total - alertas) / total * 100, 2) if total > 0 else 0
            },
            "data": lecturas_formateadas
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/lecturas/alertas")
async def get_alertas_activas():
    """Obtener solo las lecturas con alertas activas"""
    try:
        lecturas = db.query("""
            SELECT * FROM lecturas 
            WHERE alerta_activa = true 
            ORDER BY timestamp DESC
        """)
        
        lecturas_formateadas = []
        for l in lecturas:
            lecturas_formateadas.append({
                "id": l['id'],
                "sensorId": l['sensor_id'],
                "ubicacionId": l['ubicacion_id'],
                "timestamp": l['timestamp'].isoformat(),
                "temperatura": float(l['temperatura']),
                "gps": {
                    "latitud": float(l['latitud']),
                    "longitud": float(l['longitud']),
                    "altitud": float(l['altitud']) if l['altitud'] else None
                },
                "estado": l['estado'],
                "alertaActiva": l['alerta_activa'],
                "tiempoFueraRango": l['tiempo_fuera_rango'],
                "cadenRota": l['cadena_rota']
            })
        
        return {
            "total": len(lecturas_formateadas),
            "data": lecturas_formateadas
        }
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/lecturas/cadena-rota")
async def get_cadenas_rotas():
    """Obtener lecturas donde se ha detectado rotura de cadena"""
    try:
        lecturas = db.query("""
            SELECT * FROM lecturas 
            WHERE cadena_rota = true 
            ORDER BY timestamp DESC
        """)
        
        lecturas_formateadas = []
        for l in lecturas:
            lecturas_formateadas.append({
                "id": l['id'],
                "sensorId": l['sensor_id'],
                "ubicacionId": l['ubicacion_id'],
                "timestamp": l['timestamp'].isoformat(),
                "temperatura": float(l['temperatura']),
                "gps": {
                    "latitud": float(l['latitud']),
                    "longitud": float(l['longitud']),
                    "altitud": float(l['altitud']) if l['altitud'] else None
                },
                "estado": l['estado'],
                "alertaActiva": l['alerta_activa'],
                "tiempoFueraRango": l['tiempo_fuera_rango'],
                "cadenRota": l['cadena_rota']
            })
        
        # Agrupar por sensor
        por_sensor = {}
        for lectura in lecturas_formateadas:
            sensor_id = lectura['sensorId']
            if sensor_id not in por_sensor:
                por_sensor[sensor_id] = []
            por_sensor[sensor_id].append(lectura)
        
        return {
            "total": len(lecturas_formateadas),
            "sensores_afectados": len(por_sensor),
            "por_sensor": por_sensor,
            "data": lecturas_formateadas
        }
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/lecturas/estadisticas/{ubicacion_id}")
async def get_estadisticas_ubicacion(ubicacion_id: str):
    """Obtener estadísticas de temperatura de una ubicación específica"""
    try:
        lecturas = db.query("""
            SELECT * FROM lecturas 
            WHERE ubicacion_id = %s
            ORDER BY timestamp DESC
        """, (ubicacion_id,))
        
        if not lecturas:
            raise HTTPException(
                status_code=404,
                detail=f"No hay lecturas para la ubicación {ubicacion_id}"
            )
        
        temperaturas = [float(l['temperatura']) for l in lecturas]
        
        estadisticas = {
            "ubicacionId": ubicacion_id,
            "total_lecturas": len(lecturas),
            "temperatura_promedio": round(sum(temperaturas) / len(temperaturas), 2),
            "temperatura_minima": min(temperaturas),
            "temperatura_maxima": max(temperaturas),
            "lecturas_normales": len([l for l in lecturas if l['estado'] == 'normal']),
            "lecturas_alerta": len([l for l in lecturas if l['estado'] == 'alerta']),
            "lecturas_criticas": len([l for l in lecturas if l['estado'] == 'critico']),
            "cadena_rota": any([l['cadena_rota'] for l in lecturas]),
            "tiempo_max_fuera_rango": max([l['tiempo_fuera_rango'] for l in lecturas])
        }
        
        return estadisticas
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== VEHÍCULOS ====================

@app.get("/vehiculos")
async def get_vehiculos():
    """Obtener listado de vehículos"""
    try:
        vehiculos = db.query("SELECT * FROM vehiculos ORDER BY matricula")
        return {"data": [dict(v) for v in vehiculos]}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/vehiculos/{vehiculo_id}")
async def get_vehiculo(vehiculo_id: str):
    """Obtener un vehículo específico por ID"""
    try:
        vehiculo = db.query_one(
            "SELECT * FROM vehiculos WHERE id = %s",
            (vehiculo_id,)
        )
        
        if not vehiculo:
            raise HTTPException(status_code=404, detail="Vehículo no encontrado")
        
        return dict(vehiculo)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/vehiculos/{vehiculo_id}/estado-cadena")
async def get_estado_cadena_vehiculo(vehiculo_id: str):
    """Estado completo de la cadena de temperatura para un vehículo"""
    try:
        # Verificar que el vehículo existe
        vehiculo = db.query_one(
            "SELECT * FROM vehiculos WHERE id = %s",
            (vehiculo_id,)
        )
        
        if not vehiculo:
            raise HTTPException(status_code=404, detail="Vehículo no encontrado")
        
        # Obtener sensores del vehículo
        sensores = db.query(
            "SELECT * FROM sensores WHERE ubicacion_id = %s AND activo = true",
            (vehiculo_id,)
        )
        
        if not sensores:
            return {
                "vehiculoId": vehiculo_id,
                "matricula": vehiculo['matricula'],
                "estado_general": "sin_sensores",
                "zonas": []
            }
        
        zonas = []
        estado_general = "normal"
        
        for sensor in sensores:
            # Obtener última lectura del sensor
            ultima_lectura = db.query_one("""
                SELECT * FROM lecturas 
                WHERE sensor_id = %s 
                ORDER BY timestamp DESC 
                LIMIT 1
            """, (sensor['id'],))
            
            if ultima_lectura:
                zona_info = {
                    "sensorId": sensor['id'],
                    "nombre": sensor['nombre'],
                    "tipoAlimento": sensor['tipo_alimento'],
                    "rangoOptimo": f"{sensor['rango_min']}°C - {sensor['rango_max']}°C",
                    "temperaturaActual": float(ultima_lectura['temperatura']),
                    "estado": ultima_lectura['estado'],
                    "alertaActiva": ultima_lectura['alerta_activa'],
                    "tiempoFueraRango": ultima_lectura['tiempo_fuera_rango'],
                    "cadenRota": ultima_lectura['cadena_rota'],
                    "ultimaActualizacion": ultima_lectura['timestamp'].isoformat()
                }
                
                zonas.append(zona_info)
                
                # Actualizar estado general
                if ultima_lectura['cadena_rota']:
                    estado_general = "cadena_rota"
                elif ultima_lectura['estado'] == 'critico' and estado_general != "cadena_rota":
                    estado_general = "critico"
                elif ultima_lectura['estado'] == 'alerta' and estado_general not in ["critico", "cadena_rota"]:
                    estado_general = "alerta"
        
        return {
            "vehiculoId": vehiculo_id,
            "matricula": vehiculo['matricula'],
            "estado_general": estado_general,
            "total_zonas": len(zonas),
            "zonas_normal": len([z for z in zonas if z['estado'] == 'normal']),
            "zonas_alerta": len([z for z in zonas if z['estado'] == 'alerta']),
            "zonas_criticas": len([z for z in zonas if z['estado'] == 'critico']),
            "cadenas_rotas": len([z for z in zonas if z['cadenRota']]),
            "zonas": zonas
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== TRACKING GPS ====================

@app.get("/lecturas/tracking/{ubicacion_id}")
async def get_tracking_ubicacion(
    ubicacion_id: str,
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    limit: int = Query(50, ge=1, le=500)
):
    """Obtener el tracking (ruta GPS) de una ubicación"""
    try:
        sql = "SELECT * FROM lecturas WHERE ubicacion_id = %s"
        params = [ubicacion_id]
        
        if from_date:
            try:
                from_dt = date_parser.isoparse(from_date)
                sql += " AND timestamp >= %s"
                params.append(from_dt)
            except ValueError:
                raise HTTPException(status_code=400, detail="Formato de fecha 'from' inválido")
        
        if to_date:
            try:
                to_dt = date_parser.isoparse(to_date)
                sql += " AND timestamp <= %s"
                params.append(to_dt)
            except ValueError:
                raise HTTPException(status_code=400, detail="Formato de fecha 'to' inválido")
        
        sql += " ORDER BY timestamp ASC LIMIT %s"
        params.append(limit)
        
        lecturas = db.query(sql, params)
        
        if not lecturas:
            raise HTTPException(
                status_code=404,
                detail=f"No hay lecturas para la ubicación {ubicacion_id}"
            )
        
        tracking_points = []
        for l in lecturas:
            tracking_points.append({
                "timestamp": l['timestamp'].isoformat(),
                "latitud": float(l['latitud']),
                "longitud": float(l['longitud']),
                "altitud": float(l['altitud']) if l['altitud'] else None,
                "temperatura": float(l['temperatura']),
                "estado": l['estado']
            })
        
        return {
            "ubicacionId": ubicacion_id,
            "total_puntos": len(tracking_points),
            "puntos": tracking_points
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/lecturas/mapa")
async def get_mapa_todas_ubicaciones():
    """Obtener la última posición GPS de todas las ubicaciones"""
    try:
        # Obtener última lectura por ubicación
        lecturas = db.query("""
            WITH ultima_lectura AS (
                SELECT DISTINCT ON (ubicacion_id) *
                FROM lecturas
                ORDER BY ubicacion_id, timestamp DESC
            )
            SELECT * FROM ultima_lectura
        """)
        
        ubicaciones_actuales = []
        for l in lecturas:
            ubicaciones_actuales.append({
                "ubicacionId": l['ubicacion_id'],
                "sensorId": l['sensor_id'],
                "timestamp": l['timestamp'].isoformat(),
                "latitud": float(l['latitud']),
                "longitud": float(l['longitud']),
                "altitud": float(l['altitud']) if l['altitud'] else None,
                "temperatura": float(l['temperatura']),
                "estado": l['estado'],
                "alertaActiva": l['alerta_activa'],
                "cadenRota": l['cadena_rota']
            })
        
        return {
            "total_ubicaciones": len(ubicaciones_actuales),
            "ubicaciones": ubicaciones_actuales
        }
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== DASHBOARD ====================

@app.get("/dashboard/resumen")
async def get_dashboard_resumen():
    """Resumen general del sistema de monitoreo"""
    try:
        # Contar sensores por tipo de alimento
        sensores_stats = db.query("""
            SELECT tipo_alimento, COUNT(*) as total
            FROM sensores
            WHERE activo = true
            GROUP BY tipo_alimento
        """)
        
        sensores_por_tipo = {row['tipo_alimento']: row['total'] for row in sensores_stats}
        
        # Estadísticas de lecturas
        lecturas_stats = db.query("""
            SELECT estado, COUNT(*) as total
            FROM lecturas
            WHERE timestamp >= NOW() - INTERVAL '24 hours'
            GROUP BY estado
        """)
        
        lecturas_por_estado = {row['estado']: row['total'] for row in lecturas_stats}
        
        # Alertas y cadenas rotas
        alertas = db.query("SELECT COUNT(*) as total FROM lecturas WHERE alerta_activa = true")
        cadenas_rotas = db.query("SELECT COUNT(*) as total FROM lecturas WHERE cadena_rota = true")
        
        total_sensores = sum(sensores_por_tipo.values())
        total_lecturas = sum(lecturas_por_estado.values())
        total_vehiculos = db.query("SELECT COUNT(*) as total FROM vehiculos")[0]['total']
        
        return {
            "timestamp_consulta": datetime.utcnow().isoformat() + "Z",
            "total_sensores": total_sensores,
            "sensores_por_tipo_alimento": sensores_por_tipo,
            "total_lecturas_24h": total_lecturas,
            "lecturas_por_estado": lecturas_por_estado,
            "total_vehiculos": total_vehiculos,
            "alertas_activas": alertas[0]['total'],
            "cadenas_rotas": cadenas_rotas[0]['total'],
            "porcentaje_salud": round(
                (lecturas_por_estado.get('normal', 0) / total_lecturas * 100) if total_lecturas > 0 else 100,
                2
            )
        }
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ==================== RUTA RAÍZ ====================

@app.get("/")
async def root():
    """Información del servicio IoT"""
    return {
        "servicio": "IoT Fresh&Go - Monitoreo Temperatura",
        "version": "2.0.0",
        "database": "PostgreSQL",
        "descripcion": "Sistema de monitoreo de temperatura y GPS",
        "categorias_alimentos": {
            "congelado": {
                "rango_optimo": "-18°C a -22°C",
                "umbral_alerta": "> -15°C",
                "umbral_critico": "> -12°C",
                "tiempo_maximo_fuera_rango": "15 minutos"
            },
            "refrigerado": {
                "rango_optimo": "0°C - 4°C",
                "umbral_alerta": "> 4°C",
                "umbral_critico": "> 7°C",
                "tiempo_maximo_fuera_rango": "30 minutos"
            },
            "delicado": {
                "rango_optimo": "0°C - 2°C",
                "umbral_alerta": "> 2°C",
                "umbral_critico": "> 3°C",
                "tiempo_maximo_fuera_rango": "15 minutos"
            }
        },
        "endpoints": [
            "GET /sensores",
            "GET /lecturas",
            "GET /vehiculos",
            "GET /dashboard/resumen",
            "GET /docs - Documentación Swagger"
        ]
    }

@app.get("/health")
async def health_check():
    """Verificar estado de la conexión a base de datos"""
    try:
        db.query("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv('PORT', 8001)))