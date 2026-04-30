import AppointmentService from "../services/appointment.service.js";

class AppointmentController {

    /**
     * @swagger
     * /api/appointments:
     *   post:
     *     summary: Crear una cita para un padre (Solo Coordinador)
     *     tags: [Appointments]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - parentId
     *               - date
     *               - startTime
     *               - endTime
     *               - reason
     *             properties:
     *               parentId:
     *                 type: string
     *               date:
     *                 type: string
     *                 format: date
     *               startTime:
     *                 type: string
     *                 description: Hora de inicio en formato HH:mm, HH:mm:ss o fecha ISO completa.
     *               endTime:
     *                 type: string
     *                 description: Hora de fin en formato HH:mm, HH:mm:ss o fecha ISO completa.
     *               reason:
     *                 type: string
     *                 minLength: 5
     *                 maxLength: 500
     *           example:
     *             parentId: "17192b4a-8f73-475b-8098-da7770b0cd19"
     *             date: "2026-04-25"
     *             startTime: "08:00"
     *             endTime: "09:00"
     *             reason: "Su hijo organizo pelea de gallos"
     *     responses:
     *       201:
     *         description: Cita creada exitosamente
     *       400:
     *         description: Campos faltantes o datos inválidos
     *       401:
     *         description: No autorizado - Token requerido
     *       403:
     *         description: Solo coordinadores pueden crear citas
     */
    static async create(req, res) {
        try {
            const { parentId, date, startTime, endTime, reason } = req.body;

            if (!parentId || !date || !startTime || !endTime || !reason) {
                return res.status(400).json({
                    message: "Faltan campos obligatorios: parentId, date, startTime, endTime, reason"
                });
            }

            if (reason.length < 5 || reason.length > 500) {
                return res.status(400).json({
                    message: "La razón debe tener entre 5 y 500 caracteres"
                });
            }

            const appointment = await AppointmentService.createAppointment({
                parentId,
                coordinatorId: req.user.id,
                date,
                startTime,
                endTime,
                reason
            });

            return res.status(201).json(appointment);

        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }

    /**
     * @swagger
     * /api/appointments:
     *   get:
     *     summary: Listar citas del usuario
     *     tags: [Appointments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: parentId
     *         schema:
     *           type: string
     *         description: Filtrar por padre específico (solo coordinadores)
     *     responses:
     *       200:
     *         description: Lista de citas obtenida exitosamente
     *       400:
     *         description: Error al listar citas
     *       401:
     *         description: No autorizado - Token requerido
     *       403:
     *         description: Rol no autorizado para acceder a este recurso
     */
    static async list(req, res) {
        try {
            const data = await AppointmentService.getAppointmentsByUser(
                req.user.id,
                req.user.role,
                req.query.parentId
            );

            return res.json(data);

        } catch (error) {
            if (error.message === "Rol no autorizado") {
                return res.status(403).json({
                    message: "Tu rol no tiene permisos para acceder a este recurso"
                });
            }

            return res.status(400).json({
                message: error.message
            });
        }
    }

    /**
     * @swagger
     * /api/appointments/history:
     *   get:
     *     summary: Historial de citas del coordinador
     *     tags: [Appointments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: parentId
     *         schema:
     *           type: string
     *         description: Filtrar por padre específico
     *     responses:
     *       200:
     *         description: Historial de citas del coordinador obtenido exitosamente
     *       400:
     *         description: Error al obtener el historial
     *       401:
     *         description: No autorizado - Token requerido
     *       403:
     *         description: Solo coordinadores pueden acceder al historial
     */
    static async getCoordinatorHistory(req, res) {
        try {
            const data = await AppointmentService.getAppointmentsByUser(
                req.user.id,
                req.user.role,
                req.query.parentId
            );

            return res.json(data);

        } catch (error) {
            if (error.message === "Rol no autorizado") {
                return res.status(403).json({
                    message: "Solo coordinadores pueden acceder al historial"
                });
            }

            return res.status(400).json({
                message: error.message
            });
        }
    }

    /**
     * @swagger
     * /api/appointments/my-history:
     *   get:
     *     summary: Historial de citas del padre
     *     tags: [Appointments]
     *     security:
     *       - bearerAuth: []
     */
    static async getParentHistory(req, res) {
        try {
            const data = await AppointmentService.getAppointmentsByUser(
                req.user.id,
                req.user.role
            );

            return res.json(data);

        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }

    /**
     * @swagger
     * /api/appointments/{id}/confirm:
     *   patch:
     *     summary: Confirmar una cita (Solo Padre)
     *     tags: [Appointments]
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
     *         description: Cita confirmada exitosamente
     *       400:
     *         description: ID inválido o cita no puede confirmarse
     *       401:
     *         description: No autorizado - Token requerido
     *       403:
     *         description: Solo padres pueden confirmar citas
     *       404:
     *         description: La cita no existe
     */
    static async confirm(req, res) {
        try {
            if (req.user.role.toLowerCase() !== "padre") {
                return res.status(403).json({
                    message: "Solo padres pueden confirmar citas"
                });
            }

            if (!req.params.id) {
                return res.status(400).json({
                    message: "ID de la cita es requerido"
                });
            }

            const appointment = await AppointmentService.confirmAppointment(
                req.params.id,
                req.user.id
            );

            return res.json(appointment);

        } catch (error) {
            if (error.message.includes("no encontrada")) {
                return res.status(404).json({
                    message: "La cita no existe"
                });
            }

            return res.status(400).json({
                message: error.message
            });
        }
    }

    /**
     * @swagger
     * /api/appointments/{id}/cancel:
     *   patch:
     *     summary: Cancelar una cita (Solo Padre)
     *     tags: [Appointments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de la cita a cancelar
     *     responses:
     *       200:
     *         description: Cita cancelada exitosamente
     *       400:
     *         description: ID inválido o la cita no puede cancelarse
     *       401:
     *         description: No autorizado - Token requerido
     *       403:
     *         description: Solo padres pueden cancelar citas
     *       404:
     *         description: La cita no existe
     */
    static async cancel(req, res) {
        try {
            if (req.user.role.toLowerCase() !== "padre") {
                return res.status(403).json({
                    message: "Solo padres pueden cancelar citas"
                });
            }

            if (!req.params.id) {
                return res.status(400).json({
                    message: "ID de la cita es requerido"
                });
            }

            const appointment = await AppointmentService.cancelAppointment(
                req.params.id,
                req.user.id
            );

            return res.json(appointment);

        } catch (error) {
            if (error.message.includes("no encontrada")) {
                return res.status(404).json({
                    message: "La cita no existe"
                });
            }

            return res.status(400).json({
                message: error.message
            });
        }
    }

    /**
     * @swagger
     * /api/appointments/{id}/reschedule:
     *   put:
     *     summary: Reagendar una cita cancelada (Solo Coordinador)
     *     description: Permite reagendar una cita que haya sido cancelada previamente. La nueva fecha debe ser posterior a la fecha original de la cita cancelada (no se permite reagendar para el mismo día). La cita reagendada volverá al estado pendiente para que el padre pueda confirmarla nuevamente.
     *     tags: [Appointments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de la cita cancelada a reagendar
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - date
     *               - startTime
     *               - endTime
     *             properties:
     *               date:
     *                 type: string
     *                 format: date
     *               startTime:
     *                 type: string
     *                 description: Hora de inicio en formato HH:mm, HH:mm:ss o fecha ISO completa.
     *               endTime:
     *                 type: string
     *                 description: Hora de fin en formato HH:mm, HH:mm:ss o fecha ISO completa.
     *           example:
     *             date: "2026-04-26"
     *             startTime: "08:00"
     *             endTime: "09:00"
     *     responses:
     *       200:
     *         description: Cita reagendada exitosamente. La cita vuelve al estado pendiente.
     *       400:
     *         description: Campos faltantes, datos inválidos o validaciones de negocio fallidas
     *       401:
     *         description: No autorizado - Token requerido
     *       403:
     *         description: Solo coordinadores pueden reagendar citas
     *       404:
     *         description: La cita no existe
     */
    static async reschedule(req, res) {
        try {
            if (req.user.role.toLowerCase() !== "coordinador") {
                return res.status(403).json({
                    message: "Solo coordinadores pueden reagendar citas"
                });
            }

            if (!req.params.id) {
                return res.status(400).json({
                    message: "ID de la cita es requerido"
                });
            }

            const { date, startTime, endTime } = req.body;

            if (!date || !startTime || !endTime) {
                return res.status(400).json({
                    message: "Faltan campos obligatorios: date, startTime, endTime"
                });
            }

            const appointment = await AppointmentService.rescheduleAppointment(
                req.params.id,
                date,
                startTime,
                endTime,
                req.user.id
            );

            return res.json(appointment);

        } catch (error) {
            if (error.message.includes("no encontrada")) {
                return res.status(404).json({
                    message: "La cita no existe"
                });
            }

            return res.status(400).json({
                message: error.message
            });
        }
    }
}

export default AppointmentController;