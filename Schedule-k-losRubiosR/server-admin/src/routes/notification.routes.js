import express from "express";
import NotificationController from "../controllers/notification.controller.js";
import JWTMiddleware from "../middlewares/JWT.middleware.js";

const router = express.Router();

router.post(
  "/broadcast",
  JWTMiddleware,
  NotificationController.broadcast
);

router.get(
  "/my",
  JWTMiddleware,
  NotificationController.getMyNotifications
);

router.get(
  "/history",
  JWTMiddleware,
  NotificationController.getSentNotifications
);

export default router;