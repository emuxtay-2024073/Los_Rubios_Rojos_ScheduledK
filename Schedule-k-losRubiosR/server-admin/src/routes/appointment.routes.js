import express from "express";
import AppointmentController from "../controllers/appointment.controller.js";
import authMiddleware from "../middlewares/JWT.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Coordinador"),
  AppointmentController.create
);

router.get(
  "/",
  authMiddleware,
  AppointmentController.list
);

router.get(
  "/history",
  authMiddleware,
  roleMiddleware("Coordinador"),
  AppointmentController.getCoordinatorHistory
);

router.get(
  "/my-history",
  authMiddleware,
  roleMiddleware("Padre"),
  AppointmentController.getParentHistory
);

router.patch(
  "/:id/confirm",
  authMiddleware,
  roleMiddleware("Padre"),
  AppointmentController.confirm
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("Padre"),
  AppointmentController.cancel
);

router.put(
  "/:id/reschedule",
  authMiddleware,
  roleMiddleware("Coordinador"),
  AppointmentController.reschedule
);

export default router;