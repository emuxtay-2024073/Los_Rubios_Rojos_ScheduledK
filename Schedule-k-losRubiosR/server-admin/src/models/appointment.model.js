import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        parentId: {
        type: String,
        required: true,
        index: true
        },
        coordinatorId: {
        type: String,
        required: true,
        index: true
        },
        date: {
        type: Date,
        required: true,
        index: true
        },
        startTime: {
        type: Date,
        required: true
        },
        endTime: {
        type: Date,
        required: true
        },
        reason: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 500
        },
        status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "CANCELLED", "RESCHEDULED", "COMPLETED"],
        default: "PENDING",
        index: true
        }
    },
    { timestamps: true }
);

// Índice compuesto para evitar búsquedas lentas por coordinador y fecha
appointmentSchema.index({ coordinatorId: 1, date: 1 });

export default mongoose.model("Appointment", appointmentSchema);