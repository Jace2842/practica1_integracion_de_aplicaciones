const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

// Crear instancia de AJV con configuración
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false
});

// Agregar formatos (date, email, uri, etc.)
addFormats(ajv);

/**
 * Carga un schema desde archivo
 * @param {string} schemaPath - Ruta al archivo de schema
 * @returns {object} Schema JSON
 */
function loadSchema(schemaPath) {
  try {
    const fullPath = path.join(__dirname, '../schemas', schemaPath);
    const schemaContent = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(schemaContent);
  } catch (error) {
    logger.error(`Error loading schema ${schemaPath}:`, error.message);
    throw new Error(`Failed to load schema: ${schemaPath}`);
  }
}

/**
 * Valida datos contra un schema JSON
 * @param {object} data - Datos a validar
 * @param {object|string} schema - Schema JSON o ruta al archivo de schema
 * @returns {object} { valid: boolean, errors: array }
 */
function validate(data, schema) {
  try {
    // Si schema es una ruta, cargar el schema
    let schemaObj = schema;
    if (typeof schema === 'string') {
      schemaObj = loadSchema(schema);
    }

    // Compilar y validar
    const validateFn = ajv.compile(schemaObj);
    const valid = validateFn(data);

    if (!valid) {
      logger.debug('Validation errors:', validateFn.errors);
      return {
        valid: false,
        errors: formatErrors(validateFn.errors)
      };
    }

    return { valid: true, errors: [] };
  } catch (error) {
    logger.error('Error during validation:', error.message);
    return {
      valid: false,
      errors: [{ message: 'Internal validation error', error: error.message }]
    };
  }
}

/**
 * Formatea los errores de AJV para que sean más legibles
 * @param {Array} errors - Errores de AJV
 * @returns {Array} Errores formateados
 */
function formatErrors(errors) {
  if (!errors) return [];

  return errors.map(error => {
    const field = error.instancePath || error.dataPath || 'data';
    let message = error.message;

    // Mejorar mensajes según el tipo de error
    switch (error.keyword) {
      case 'required':
        message = `Missing required field: ${error.params.missingProperty}`;
        break;
      case 'type':
        message = `Field ${field} should be ${error.params.type}`;
        break;
      case 'format':
        message = `Field ${field} should match format ${error.params.format}`;
        break;
      case 'enum':
        message = `Field ${field} should be one of: ${error.params.allowedValues.join(', ')}`;
        break;
      case 'minLength':
        message = `Field ${field} should have at least ${error.params.limit} characters`;
        break;
      case 'maxLength':
        message = `Field ${field} should have at most ${error.params.limit} characters`;
        break;
      case 'minimum':
        message = `Field ${field} should be >= ${error.params.limit}`;
        break;
      case 'maximum':
        message = `Field ${field} should be <= ${error.params.limit}`;
        break;
      case 'pattern':
        message = `Field ${field} should match pattern ${error.params.pattern}`;
        break;
      default:
        message = `${field}: ${error.message}`;
    }

    return {
      field: field,
      message: message,
      keyword: error.keyword,
      params: error.params
    };
  });
}

/**
 * Middleware de Express para validar el body de la request
 * @param {object|string} schema - Schema JSON o ruta al archivo
 * @returns {function} Middleware de Express
 */
function validateMiddleware(schema) {
  return (req, res, next) => {
    const result = validate(req.body, schema);

    if (!result.valid) {
      logger.warn('Validation failed:', result.errors);
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request body validation failed',
        details: result.errors
      });
    }

    next();
  };
}

/**
 * Valida la respuesta del endpoint /clientes/detalle
 * @param {object} data - Datos a validar
 * @returns {object} { valid: boolean, errors: array }
 */
function validateClienteDetalle(data) {
  return validate(data, 'cliente-detalle.schema.json');
}

module.exports = {
  validate,
  validateMiddleware,
  validateClienteDetalle,
  loadSchema,
  formatErrors
};
