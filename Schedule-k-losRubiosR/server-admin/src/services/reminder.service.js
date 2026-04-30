import cron from "node-cron";
import nodemailer from "nodemailer";
import Appointment from "../models/appointment.model.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Función para obtener email de usuario desde Auth Service
const getUserEmail = async (userId) => {
    try {
        const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:5065";
        const response = await fetch(`${authServiceUrl}/api/auth/user/${userId}`, {
            headers: {
                'X-Internal-Secret': process.env.INTERNAL_AUTH_SECRET || ''
            }
        });
        if (!response.ok) throw new Error('Error obteniendo usuario');
        const user = await response.json();
        return user.email;
    } catch (error) {
        console.error(`Error obteniendo email para user ${userId}:`, error.message);
        return null;
    }
};

const sendReminders = async () => {
    try {
        const now = new Date();

        // Recordatorios 24 horas antes
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);

        const reminders24h = await Appointment.find({
            status: { $in: ["CONFIRMED", "RESCHEDULED"] },
            date: { $gte: tomorrow, $lte: tomorrowEnd }
        });

        for (const appointment of reminders24h) {
            const parentEmail = await getUserEmail(appointment.parentId);
            if (parentEmail) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: parentEmail,
                    subject: "Recordatorio de Cita - Scheduled-K",
                    text: `Estimado padre/madre,\n\nLe recordamos que tiene una cita programada para mañana ${appointment.date.toLocaleDateString('es-ES')} de ${appointment.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} a ${appointment.endTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.\n\nRazón: ${appointment.reason}\n\nPor favor, confirme su asistencia o cancele si no podrá asistir.\n\nAtentamente,\nScheduled-K`
                };
                await transporter.sendMail(mailOptions);
                console.log(`Recordatorio 24h enviado al padre: ${parentEmail}`);
            }
        }

        // Recordatorios 2 horas antes
        const in2Hours = new Date(now);
        in2Hours.setHours(now.getHours() + 2);
        const in2HoursEnd = new Date(in2Hours);
        in2HoursEnd.setMinutes(in2Hours.getMinutes() + 30); // Ventana de 30 min

        const reminders2h = await Appointment.find({
            status: { $in: ["CONFIRMED", "RESCHEDULED"] },
            startTime: { $gte: in2Hours, $lt: in2HoursEnd }
        });

        for (const appointment of reminders2h) {
            const parentEmail = await getUserEmail(appointment.parentId);
            if (parentEmail) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: parentEmail,
                    subject: "Recordatorio Urgente de Cita - Scheduled-K",
                    text: `Estimado padre/madre,\n\nLe recordamos que su cita está programada para dentro de 2 horas: ${appointment.date.toLocaleDateString('es-ES')} a las ${appointment.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.\n\nRazón: ${appointment.reason}\n\nPor favor, llegue puntualmente.\n\nAtentamente,\nScheduled-K`
                };
                await transporter.sendMail(mailOptions);
                console.log(`Recordatorio 2h enviado al padre: ${parentEmail}`);
            }
        }
    } catch (error) {
        console.error("Error en el proceso de recordatorios:", error.message);
    }
};

export const initReminderJob = () => {
    // Ejecutar cada hora para verificar recordatorios
    cron.schedule("0 * * * *", () => {
        console.log("Verificando recordatorios de citas...");
        sendReminders();
    });
};