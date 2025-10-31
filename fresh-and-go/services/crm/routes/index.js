// Routes - Definición de endpoints
const express = require('express');
const router = express.Router();
const { AppError, asyncHandler } = require('../middleware/errorHandler');

module.exports = function(controllers, data, validator) {
  // CLIENTES
  router.get('/clientes', asyncHandler((req, res) => {
    const result = controllers.clientes.getAll(data, req.query, validator);
    if (result.status) {
      throw new AppError(result.error, result.status);
    }
    res.json(result);
  }));

  router.get('/clientes/:id', asyncHandler((req, res) => {
    const result = controllers.clientes.getById(data, req.params.id, validator);
    if (result.status) {
      throw new AppError(result.error, result.status);
    }
    res.json(result);
  }));

  // PEDIDOS
  router.get('/pedidos', asyncHandler((req, res) => {
    const result = controllers.pedidos.getAll(data, req.query, validator);
    if (result.status) {
      throw new AppError(result.error, result.status);
    }
    res.json(result);
  }));

  router.get('/pedidos/:id', asyncHandler((req, res) => {
    const result = controllers.pedidos.getById(data, req.params.id, validator);
    if (result.status) {
      throw new AppError(result.error, result.status);
    }
    res.json(result);
  }));

  // PROVEEDORES
  router.get('/proveedores', asyncHandler((req, res) => {
    const result = controllers.proveedores.getAll(data, req.query, validator);
    if (result.status) {
      throw new AppError(result.error, result.status);
    }
    res.json(result);
  }));

  router.get('/proveedores/:id', asyncHandler((req, res) => {
    const result = controllers.proveedores.getById(data, req.params.id, validator);
    if (result.status) {
      throw new AppError(result.error, result.status);
    }
    res.json(result);
  }));

  // CONDUCTORES
  router.get('/conductores', asyncHandler((req, res) => {
    const result = controllers.conductores.getAll(data, req.query, validator);
    if (result.status) {
      throw new AppError(result.error, result.status);
    }
    res.json(result);
  }));

  router.get('/conductores/:id', asyncHandler((req, res) => {
    const result = controllers.conductores.getById(data, req.params.id, validator);
    if (result.status) {
      throw new AppError(result.error, result.status);
    }
    res.json(result);
  }));

  return router;
};
