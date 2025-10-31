from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
from typing import Optional, List
from datetime import datetime
from dateutil import parser as date_parser
import jsonschema
import logging

# Importar módulos
from data import sensores, lecturas, vehiculos
from routes import setup_routes
from error_handlers import setup_exception_handlers

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="IoT Fresh&Go",
    version="1.0.0",
    description="Servicio IoT con arquitectura modular (routes, controllers, data)"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar manejadores centralizados de errores
setup_exception_handlers(app)

# Cargar schemas
def load_schema(filename: str):
    schema_path = Path(__file__).parent.parent.parent / "schemas" / filename
    with open(schema_path, 'r', encoding='utf-8') as f:
        return json.load(f)

schemas = {
    'sensor': load_schema('sensor.schema.json'),
    'lectura': load_schema('lectura.schema.json'),
    'vehiculo': load_schema('vehiculo.schema.json')
}

# Función de validación
class SchemaValidator:
    def __init__(self, schemas):
        self.schemas = schemas
    
    def validate_sensor(self, sensor):
        try:
            jsonschema.validate(instance=sensor, schema=self.schemas['sensor'])
            return True
        except jsonschema.exceptions.ValidationError as e:
            print(f"Error: {e}")
            return False
    
    def validate_lectura(self, lectura):
        try:
            jsonschema.validate(instance=lectura, schema=self.schemas['lectura'])
            return True
        except jsonschema.exceptions.ValidationError as e:
            print(f"Error: {e}")
            return False
    
    def validate_vehiculo(self, vehiculo):
        try:
            jsonschema.validate(instance=vehiculo, schema=self.schemas['vehiculo'])
            return True
        except jsonschema.exceptions.ValidationError as e:
            print(f"Error: {e}")
            return False

validator = SchemaValidator(schemas)

# ==================== USAR MÓDULOS ====================
data = {
    'sensores': sensores,
    'lecturas': lecturas,
    'vehiculos': vehiculos
}

routes = setup_routes(data, validator)
app.include_router(routes)

# Ruta raíz
@app.get("/")
async def root():
    return {
        "servicio": "IoT Fresh&Go",
        "version": "1.0.0",
        "arquitectura": "Modular (routes, controllers, data)",
        "endpoints": [
            "GET /sensores",
            "GET /sensores/{id}",
            "GET /lecturas",
            "GET /vehiculos",
            "GET /vehiculos/{id}",
            "GET /docs - Documentación interactiva"
        ],
        "manejo_errores": "Centralizado con exception handlers"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Iniciando IoT Service con manejadores centralizados de errores")
    uvicorn.run(app, host="0.0.0.0", port=8001)
    print("✅ IoT Service listo en http://localhost:8001")
    print("📁 Estructura: /data - /controllers - /routes")
    uvicorn.run(app, host="0.0.0.0", port=8001)