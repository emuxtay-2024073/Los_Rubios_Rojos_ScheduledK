import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        coordinatorId: {
            type: String,
            required: true,
            index: true
        },
        isBroadcast: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Índice por coordinador y fecha
notificationSchema.index({ coordinatorId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);