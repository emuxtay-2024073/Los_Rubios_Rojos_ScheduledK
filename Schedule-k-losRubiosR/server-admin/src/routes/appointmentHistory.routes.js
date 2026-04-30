import express from "express";
import { getHistory } from "../controllers/appointmentHistory.controller.js";
import JWTMiddleware from "../middlewares/JWT.middleware.js";

const router = express.Router();

router.get("/:id", JWTMiddleware, getHistory);

export default router;