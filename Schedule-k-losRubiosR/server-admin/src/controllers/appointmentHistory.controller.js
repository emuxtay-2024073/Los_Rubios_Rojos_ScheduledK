import historyService from "../services/appointmentHistory.service.js";
import logger from "../config/logger.js";

/**
 * @swagger
 * /api/history:
 *   post:
 *     summary: Crear un registro de historial
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - action
 *             properties:
 *               appointmentId:
 *                 type: string
 *               action:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro de historial creado exitosamente
 *       400:
 *         description: Campos faltantes o datos inválidos
 *       401:
 *         description: No autorizado - Token requerido o inválido
 */
export const createHistory = async (req, res, next) => {
  try {
    const { appointmentId, action } = req.body;

    if (!appointmentId || !action) {
      return res.status(400).json({ 
        message: "Faltan campos obligatorios: appointmentId, action" 
      });
    }

    const history = await historyService.createHistory({
      appointmentId,
      action,
      performedBy: req.user.id,
    });

    logger.info(`History created: ${action}`);

    res.status(201).json(history);

  } catch (error) {
    logger.error(error.message);
    next(error);
  }
};

/**
 * @swagger
 * /api/history/{id}:
 *   get:
 *     summary: Obtener historial de una cita
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Historial de la cita obtenido exitosamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado - Token requerido o inválido
 *       404:
 *         description: No hay registros de historial para esta cita
 */
export const getHistory = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ 
        message: "ID de la cita es requerido" 
      });
    }

    const history = await historyService.getHistoryByAppointment(req.params.id);
    
    if (!history || history.length === 0) {
      return res.status(404).json({ 
        message: "No hay registros de historial para esta cita" 
      });
    }

    res.json(history);

  } catch (error) {
    logger.error(error.message);
    next(error);
  }
};