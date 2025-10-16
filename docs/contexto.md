# Escenario Inicial - LogiFresh Solutions

## 📌 Nombre de la empresa
**LogiFresh Solutions**

## 🏢 Actividad principal
LogiFresh Solutions es una empresa especializada en logística de última milla para productos frescos y congelados.  
Su misión es garantizar entregas rápidas y seguras desde supermercados y distribuidores hasta clientes finales, manteniendo siempre la cadena de frío.

## 💻 Sistemas de información existentes
Actualmente, la empresa dispone de varios sistemas que funcionan de manera independiente:

- **CRM (Gestión de Clientes y Proveedores):** almacena información de clientes, pedidos recurrentes y contratos con supermercados.
- **ERP (Gestión de Recursos):** controla inventarios, facturación y recursos humanos.
- **Plataforma IoT:** instalada en vehículos, recopila datos de GPS, consumo de combustible y sensores de temperatura.
- **Aplicación móvil de conductores:** permite a los transportistas recibir asignaciones y confirmar entregas.
- **Base de datos de pedidos:** centraliza registros de compras y entregas, aunque no se encuentra integrada con el resto de sistemas.

## ⚠️ Problema de integración a resolver
El principal reto de LogiFresh Solutions es la **fragmentación de la información**:

- Los clientes no pueden consultar en tiempo real el estado de sus pedidos porque el CRM no se comunica con la plataforma IoT.
- La gestión de incidencias se realiza manualmente vía llamadas telefónicas, lo que retrasa la respuesta ante problemas.
- El ERP no comparte datos automáticamente con el CRM, generando duplicación de información administrativa.
- La aplicación de conductores funciona de forma aislada, sin retroalimentación hacia los demás sistemas.

**Objetivo de la integración:**  
Crear una **API Unificada** y un **modelo de datos común** que permitan centralizar información de clientes, pedidos, vehículos y rutas, mejorando la trazabilidad y eficiencia operativa.
