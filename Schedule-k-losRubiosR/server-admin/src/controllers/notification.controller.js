import NotificationService from "../services/notification.service.js";

class NotificationController {

    /**
     * @swagger
     * /api/notifications/broadcast:
     *   post:
     *     summary: Enviar mensaje general a todos los padres (Solo Coordinador)
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - message
     *             properties:
     *               title:
     *                 type: string
     *                 maxLength: 100
     *               message:
     *                 type: string
     *                 maxLength: 1000
     *     responses:
     *       201:
     *         description: Mensaje enviado exitosamente
     *       400:
     *         description: Campos faltantes o exceden límite de caracteres
     *       401:
     *         description: No autorizado - Token requerido o inválido
     *       403:
     *         description: Solo coordinadores pueden enviar mensajes generales
     */
    static async broadcast(req, res) {
        try {
            if (req.user.role.toLowerCase() !== 'coordinador') {
                return res.status(403).json({ message: "Solo coordinadores pueden enviar mensajes generales" });
            }

            const { title, message } = req.body;
            
            if (!title || !message) {
                return res.status(400).json({ 
                    message: "Faltan campos obligatorios: title, message" 
                });
            }

            if (title.length > 100) {
                return res.status(400).json({ 
                    message: "El título no puede exceder 100 caracteres" 
                });
            }

            if (message.length > 1000) {
                return res.status(400).json({ 
                    message: "El mensaje no puede exceder 1000 caracteres" 
                });
            }

            const notification = await NotificationService.createBroadcast(
                title,
                message,
                req.user.id,
                req.user.username || req.user.email || 'Coordinador'
            );

            res.status(201).json(notification);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/notifications/my:
     *   get:
     *     summary: Obtener mensajes generales (Padres)
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de mensajes generales obtenida exitosamente
     *       401:
     *         description: No autorizado - Token requerido o inválido
     */
    static async getMyNotifications(req, res) {
        try {
            const notifications = await NotificationService.getAllBroadcasts();
            res.json(notifications);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * @swagger
     * /api/notifications/history:
     *   get:
     *     summary: Obtener mensajes enviados (Solo Coordinador)
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de mensajes enviados obtenida exitosamente
     *       401:
     *         description: No autorizado - Token requerido o inválido
     *       403:
     *         description: Solo coordinadores pueden ver sus mensajes enviados
     */
    static async getSentNotifications(req, res) {
        try {
            if (req.user.role.toLowerCase() !== 'coordinador') {
                return res.status(403).json({ message: "Solo coordinadores pueden ver sus mensajes enviados" });
            }

            const notifications = await NotificationService.getByCoordinator(req.user.id);
            res.json(notifications);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default NotificationController;