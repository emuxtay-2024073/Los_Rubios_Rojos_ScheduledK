import express from "express";
import CalendarNoteController from "../controllers/calendarNote.controller.js";
import authMiddleware from "../middlewares/JWT.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("Coordinador"),
  CalendarNoteController.listByMonth
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Coordinador"),
  CalendarNoteController.createNote
);

export default router;
