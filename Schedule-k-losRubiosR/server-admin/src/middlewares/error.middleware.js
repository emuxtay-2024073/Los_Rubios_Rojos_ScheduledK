import logger from "../config/logger.js";

const errorMiddleware = (err, req, res, next) => {
  // Solo registrar en logs, no en consola para evitar spam
  logger.error("Error:", err);

  let statusCode = 500;
  let message = "Error interno del servidor";

  // Manejar errores de validación de MongoDB
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Datos inválidos: " + Object.values(err.errors).map(e => e.message).join(", ");
  }
  // Manejar errores de cast de MongoDB
  else if (err.name === "CastError") {
    statusCode = 400;
    message = "ID inválido";
  }
  // Manejar errores duplicados (unique constraint)
  else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `El ${field} ya existe en el sistema`;
  }
  // Manejar errores personalizados
  else if (err.status) {
    statusCode = err.status;
    message = err.message;
  }
  // Manejar mensajes de error estándar
  else if (err.message) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message
  });
};

export default errorMiddleware;