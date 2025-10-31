#  Fresh&Go – Plataforma Logística Unificada

**Autores:**  
- Mar Alejandra Quispe Escalante  
- Jesús Lacruz  

**Versión:** 1.0  
**Fecha:** 01/09/2025  

---

##  Descripción

**Fresh&Go** es una simulación de una plataforma logística moderna que busca **unificar la gestión de pedidos, flota, incidencias y usuarios** en un sistema centralizado.  
El proyecto forma parte de una práctica académica cuyo objetivo es **definir una arquitectura base** para una empresa logística ficticia dedicada a la distribución de productos alimentarios.

> Eslogan: **“De la tienda a la mesa en un click”**

---

##  Objetivos del Proyecto

- Desarrollar una **API REST** que gestione pedidos, vehículos, incidencias y usuarios.  
- Centralizar la información en una **base de datos unificada**.  
- Simular la integración con sistemas externos:
  - **CRM** → datos de clientes y proveedores  
  - **IoT** → lecturas de ubicación y temperatura  
- Ofrecer una interfaz **Frontend web** para visualizar pedidos e incidencias.  
- Sentar las bases para futuras ampliaciones (autenticación, dashboards, pagos, etc.).

---

## Presentación del Proyecto

La presentación del proyecto se encuentra en este repositorio y en Prezi.

- PDF de la presentación: [Fresh&Go-AQ.INICIAL.pdf](PresentacionYPDF/Fresh&Go-AQ.INICIAL.pdf)  
- Escanea el QR para acceder a la presentación online, ubicado en la carpeta del enlace: ![QR Presentación](PresentacionYPDF)
- Enlace directo a Prezi: [Presentación en Prezi](https://prezi.com/view/S4qhZFBD8hRKz6VAyJtk/?referral_token=oTccAslnB3FN)


---
##  Arquitectura del Sistema

La arquitectura está basada en el **modelo C4**, distribuida en varios niveles:

| Nivel | Descripción |
|-------|--------------|
| 1 | **Contexto** – Define actores y sistemas externos (CRM, IoT). |
| 2 | **Contenedores** – Frontend, API, Base de Datos, Servicios simulados. |
| 3 | **Componentes** – Controladores, servicios, repositorios y adaptadores. |
| 4 | **Lógica de Integración** – Manejador de errores y decisiones 0/1. |

---

##  Estructura de Carpetas y Contenidos

```text
PRACTICA1/
├─ schemas/        → Archivos JSON que representan las entidades del sistema
├─ diagrama/       → Archivos HTML con diagramas de cada nivel de la arquitectura (Contexto, Contenedores, Componentes, Lógica)
├─ docs/           → Documentación adicional en PDF (ej. Fresh&Go-AQ.INICIAL.pdf) que resume la información y los diagramas
├─ README.md       → Documentación principal del proyecto





