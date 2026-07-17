import mongoose from "mongoose";

const calendarNoteSchema = new mongoose.Schema(
  {
    coordinatorId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    notes: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

calendarNoteSchema.index({ coordinatorId: 1, date: 1 }, { unique: true });

export default mongoose.model("CalendarNote", calendarNoteSchema);
