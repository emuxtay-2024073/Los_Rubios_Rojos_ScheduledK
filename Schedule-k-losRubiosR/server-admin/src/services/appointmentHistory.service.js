import AppointmentHistory from "../models/appointmentHistory.model.js";

class AppointmentHistoryService {
  static async createHistory(data) {
    return await AppointmentHistory.create(data);
  }

  static async getHistoryByAppointment(appointmentId) {
    return await AppointmentHistory.find({ appointmentId }).sort({
      createdAt: -1,
    });
  }

  static async getAllHistory() {
    return await AppointmentHistory.find({}).sort({ createdAt: -1 });
  }
}

export default AppointmentHistoryService;
