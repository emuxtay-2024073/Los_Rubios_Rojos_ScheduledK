import mongoose from "mongoose";

const appointmentHistorySchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  action: {
    type: String,
    enum: ["CREATED", "CONFIRMED", "CANCELLED", "RESCHEDULED", "COMPLETED"],
    required: true,
  },
  performedBy: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Para guardar fechas anteriores, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AppointmentHistory = mongoose.model(
  "AppointmentHistory",
  appointmentHistorySchema
);

export default AppointmentHistory;