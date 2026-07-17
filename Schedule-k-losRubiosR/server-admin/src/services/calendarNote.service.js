import CalendarNote from "../models/calendarNote.model.js";

class CalendarNoteService {
  static async getNotesByMonth(coordinatorId, year, month) {
    const monthNumber = Number(month);
    const yearNumber = Number(year);
    const startDate = new Date(yearNumber, monthNumber - 1, 1);
    const endDate = new Date(yearNumber, monthNumber, 1);

    return await CalendarNote.find({
      coordinatorId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    }).sort({ date: 1 });
  }

  static async appendNote(coordinatorId, date, text) {
    const [year, month, day] = String(date).split('-').map(Number);
    if (!year || !month || !day) {
      throw new Error("Fecha inválida para la nota");
    }

    const noteDate = new Date(year, month - 1, day);
    if (Number.isNaN(noteDate.getTime())) {
      throw new Error("Fecha inválida para la nota");
    }

    const note = {
      text,
      createdAt: new Date(),
    };

    const noteDocument = await CalendarNote.findOneAndUpdate(
      { coordinatorId, date: noteDate },
      { $push: { notes: note } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return noteDocument;
  }
}

export default CalendarNoteService;
