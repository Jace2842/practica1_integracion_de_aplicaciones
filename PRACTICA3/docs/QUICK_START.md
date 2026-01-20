# 🚀 Guía Rápida de Inicio

## Iniciar Servicios

### CRM Service(CMD)
```bash
cd services/crm
npm install
npm run dev
# Puerto: 3001
```

### IoT Service(CMD)
```bash
cd services/iot
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8001
# Puerto: 8001
```
### api Service(CMD)
```bash
cd services/api-unificada                                           
npm install
python -m uvicorn main:app --reload --port 8001
# Puerto: 8001
```                                          
                                             

---

## Pruebas Básicas

### CRM
```bash
# Obtener todos los clientes
curl http://localhost:3001/clientes


# Obtener cliente por ID
curl http://localhost:3001/clientes/CLI001
```

### IoT
```bash
# Obtener sensores
curl http://localhost:8001/sensores

# Filtrar sensores por tipo
curl "http://localhost:8001/sensores?tipo=RefrigerationTemp"


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

