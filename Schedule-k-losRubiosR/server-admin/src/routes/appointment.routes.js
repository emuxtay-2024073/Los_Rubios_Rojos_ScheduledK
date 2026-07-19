import express from "express";
import AppointmentController from "../controllers/appointment.controller.js";
import authMiddleware from "../middlewares/JWT.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("COORDINADOR"),
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
  roleMiddleware("COORDINADOR"),
  AppointmentController.getCoordinatorHistory
);

router.get(
  "/my-history",
  authMiddleware,
  roleMiddleware("PADRE"),
  AppointmentController.getParentHistory
);

router.patch(
  "/:id/confirm",
  authMiddleware,
  roleMiddleware("PADRE"),
  AppointmentController.confirm
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("PADRE"),
  AppointmentController.cancel
);

router.put(
  "/:id/reschedule",
  authMiddleware,
  roleMiddleware("COORDINADOR"),
  AppointmentController.reschedule
);

export default router;