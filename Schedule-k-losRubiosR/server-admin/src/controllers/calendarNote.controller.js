import CalendarNoteService from "../services/calendarNote.service.js";

class CalendarNoteController {
  static async listByMonth(req, res) {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({ message: "Los parámetros year y month son obligatorios" });
      }

      const notes = await CalendarNoteService.getNotesByMonth(req.user.id, year, month);
      return res.json(notes);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async createNote(req, res) {
    try {
      const { date, text } = req.body;

      if (!date || !text) {
        return res.status(400).json({ message: "Los campos date y text son obligatorios" });
      }

      if (text.length > 1000) {
        return res.status(400).json({ message: "El texto de la nota no puede exceder 1000 caracteres" });
      }

      const note = await CalendarNoteService.appendNote(req.user.id, date, text);
      return res.status(201).json(note);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default CalendarNoteController;
