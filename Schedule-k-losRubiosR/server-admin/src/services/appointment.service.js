import Appointment from "../models/appointment.model.js";
import historyService from "./appointmentHistory.service.js";

class AppointmentService {
  static normalizeDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static parseAppointmentTime(date, timeValue, fieldName) {
    if (!timeValue) {
      throw new Error(`La hora de ${fieldName} es requerida`);
    }

    if (timeValue.includes("T")) {
      const parsed = new Date(timeValue);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error(
          `Formato de ${fieldName} inválido. Use HH:mm, HH:mm:ss o ISO datetime.`,
        );
      }

      const parsedDate = this.normalizeDate(parsed);
      const targetDate = this.normalizeDate(date);
      if (parsedDate.getTime() !== targetDate.getTime()) {
        throw new Error(`La fecha en ${fieldName} debe coincidir con date`);
      }

      return parsed;
    }

    const timeParts = timeValue.split(":").map((part) => Number(part));
    if (timeParts.length < 2 || timeParts.length > 3) {
      throw new Error(
        `Formato de ${fieldName} inválido. Use HH:mm o HH:mm:ss.`,
      );
    }

    const [hours, minutes, seconds = 0] = timeParts;
    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      Number.isNaN(seconds) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      throw new Error(
        `Formato de ${fieldName} inválido. Use HH:mm o HH:mm:ss.`,
      );
    }

    const parsed = this.normalizeDate(date);
    parsed.setHours(hours, minutes, seconds, 0);
    return parsed;
  }

  static async createAppointment(data) {
    const { parentId, coordinatorId, date, startTime, endTime, reason } = data;

    if (!parentId) throw new Error("El ID del padre es requerido");
    if (!coordinatorId) throw new Error("El ID del coordinador es requerido");
    if (!date) throw new Error("La fecha es requerida");
    if (!startTime) throw new Error("La hora de inicio es requerida");
    if (!endTime) throw new Error("La hora de fin es requerida");
    if (!reason) throw new Error("La razón es requerida");

    const appointmentDate = this.normalizeDate(date);
    const today = this.normalizeDate(new Date());

    if (appointmentDate < today) {
      throw new Error("No se permiten agendar citas en fechas pasadas");
    }

    const start = this.parseAppointmentTime(date, startTime, "inicio");
    const end = this.parseAppointmentTime(date, endTime, "fin");

    if (start >= end) {
      throw new Error("La hora de inicio debe ser anterior a la hora de fin");
    }

    const diffMinutes = (end - start) / (1000 * 60);
    if (diffMinutes < 30) {
      throw new Error("La cita debe durar al menos 30 minutos");
    }

    const overlapping = await Appointment.findOne({
      coordinatorId,
      date: appointmentDate,
      status: { $in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (overlapping) {
      throw new Error(
        "El coordinador ya tiene una cita programada en ese horario",
      );
    }

    const appointment = await Appointment.create({
      parentId,
      coordinatorId,
      date: appointmentDate,
      startTime: start,
      endTime: end,
      reason,
      status: "PENDING",
    });

    await historyService.createHistory({
      appointmentId: appointment._id,
      action: "CREATED",
      performedBy: coordinatorId,
    });

    return appointment;
  }

  static async getAppointmentsByUser(userId, role, parentIdFilter = null) {
    const normalizedRole = role.toUpperCase();
    if (normalizedRole === "PADRE") {
      return await Appointment.find({ parentId: userId }).sort({ date: 1 });
    }
    if (normalizedRole === "COORDINADOR") {
      const query = { coordinatorId: userId };
      if (parentIdFilter) {
        query.parentId = parentIdFilter;
      }
      return await Appointment.find(query).sort({ date: 1 });
    }
    if (normalizedRole === "ADMINISTRADOR") {
      const query = {};
      if (parentIdFilter) query.parentId = parentIdFilter;
      return await Appointment.find(query).sort({ date: 1 });
    }
    throw new Error("Rol no autorizado");
  }

  static async confirmAppointment(id, userId) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new Error("La cita no existe en el sistema");

    if (appointment.parentId !== userId) {
      throw new Error("No tienes permiso para confirmar esta cita");
    }

    if (appointment.status !== "PENDING") {
      throw new Error("Solo se pueden confirmar citas en estado pendiente");
    }

    appointment.status = "CONFIRMED";
    await appointment.save();

    await historyService.createHistory({
      appointmentId: appointment._id,
      action: "CONFIRMED",
      performedBy: userId,
    });

    return appointment;
  }

  static async cancelAppointment(id, userId) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new Error("La cita no existe en el sistema");

    if (appointment.parentId !== userId) {
      throw new Error("No tienes permiso para cancelar esta cita");
    }

    if (appointment.status === "COMPLETED") {
      throw new Error("No se pueden cancelar citas ya completadas");
    }

    if (appointment.status === "CANCELLED") {
      throw new Error("Esta cita ya está cancelada");
    }

    appointment.status = "CANCELLED";
    await appointment.save();

    await historyService.createHistory({
      appointmentId: appointment._id,
      action: "CANCELLED",
      performedBy: userId,
    });

    return appointment;
  }

  static async rescheduleAppointment(
    id,
    newDate,
    newStartTime,
    newEndTime,
    performedBy,
  ) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new Error("La cita no existe en el sistema");

    if (appointment.coordinatorId !== performedBy) {
      throw new Error("No tienes permiso para reagendar esta cita");
    }

    // Solo se puede reagendar si la cita está cancelada
    if (appointment.status !== "CANCELLED") {
      throw new Error("Solo se pueden reagendar citas que estén canceladas");
    }

    // No se puede reagendar para el mismo día ni días anteriores a la cita cancelada
    const originalDate = this.normalizeDate(appointment.date);
    const newAppointmentDate = this.normalizeDate(newDate);
    if (newAppointmentDate <= originalDate) {
      throw new Error(
        "No se puede reagendar para el mismo día ni días anteriores a la cita cancelada",
      );
    }

    // Validar que no sea una fecha pasada
    const today = this.normalizeDate(new Date());
    if (newAppointmentDate < today) {
      throw new Error("No se permite reagendar citas a fechas pasadas");
    }

    const oldDate = appointment.date;
    const oldStart = appointment.startTime;
    const oldEnd = appointment.endTime;

    const start = this.parseAppointmentTime(newDate, newStartTime, "inicio");
    const end = this.parseAppointmentTime(newDate, newEndTime, "fin");
    if (start >= end) {
      throw new Error("La hora de inicio debe ser anterior a la hora de fin");
    }

    const diffMinutes = (end - start) / (1000 * 60);
    if (diffMinutes < 30) {
      throw new Error("La cita debe durar al menos 30 minutos");
    }

    // Verificar solapamiento con el nuevo coordinador
    const overlapping = await Appointment.findOne({
      coordinatorId: appointment.coordinatorId,
      date: newAppointmentDate,
      status: { $in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
      startTime: { $lt: end },
      endTime: { $gt: start },
      _id: { $ne: id }, // Excluir la cita actual
    });

    if (overlapping) {
      throw new Error(
        "El coordinador ya tiene una cita programada en ese nuevo horario",
      );
    }

    appointment.date = newAppointmentDate;
    appointment.startTime = start;
    appointment.endTime = end;

    // Una cita cancelada que se reagenda vuelve a estar pendiente de confirmación
    appointment.status = "PENDING";

    await appointment.save();

    await historyService.createHistory({
      appointmentId: appointment._id,
      action: "RESCHEDULED",
      performedBy,
      details: {
        oldDate: oldDate.toISOString(),
        oldStart: oldStart.toISOString(),
        oldEnd: oldEnd.toISOString(),
        newDate: newDate,
        newStart: newStartTime,
        newEnd: newEndTime,
      },
    });

    return appointment;
  }
}

export default AppointmentService;
