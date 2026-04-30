import { body, validationResult } from 'express-validator';

export const historyValidation = [
    body('appointmentId')
        .notEmpty().withMessage('El ID de la cita es requerido')
        .isMongoId().withMessage('El ID de la cita es inválido'),

    body('action')
        .isIn(['CREATED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
        .withMessage('La acción debe ser: CREATED, CONFIRMED, CANCELLED o COMPLETED'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(e => e.msg).join("; ");
            return res.status(400).json({ 
                message: errorMessages
            });
        }
        next();
    }
];