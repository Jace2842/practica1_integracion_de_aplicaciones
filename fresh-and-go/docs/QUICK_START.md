# 🚀 Guía Rápida de Inicio

## Iniciar Servicios

### CRM Service(CMD)
```bash
cd services/crm
npm install
npm run dev
# Puerto: 3001
```

### IoT Service(WSL)
```bash
cd services/iot
source venv/bin/activate 
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
# Puerto: 8001
```

---

## Pruebas Básicas

### CRM
```bash
# Obtener todos los clientes
curl http://localhost:3001/clientes

# Buscar cliente específico
curl http://localhost:3001/clientes?q=nombre

# Obtener cliente por ID
curl http://localhost:3001/clientes/CLI001
```

### IoT
```bash
# Obtener sensores
curl http://localhost:8001/sensores

# Filtrar sensores por tipo
curl "http://localhost:8001/sensores?tipo=RefrigerationTemp"

# Obtener lecturas
curl http://localhost:8001/lecturas?limit=10
```

---

## Formatos de Error

```json
{
  "error": {
    "message": "Descripción del error",
    "statusCode": 404,
    "timestamp": "2025-10-31T12:34:56.789Z",
    "path": "/ruta",
    "method": "GET"
  }
}
```

---

## Documentación Completa

Ver archivos principales:
- `MANEJO_CENTRALIZADO_ERRORES.md` - Sistema de errores
- `IMPLEMENTACION_ERRORES_COMPLETA.md` - Detalles técnicos
- `DATA_CLEANUP_COMPLETE.md` - Estado de datos

**Más info:** `/docs/API_ENDPOINTS.md`
