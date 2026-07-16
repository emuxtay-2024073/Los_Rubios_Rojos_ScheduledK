import express from "express";
import { getAllHistory, getHistory } from "../controllers/appointmentHistory.controller.js";
import JWTMiddleware from "../middlewares/JWT.middleware.js";

const router = express.Router();
router.get("/", JWTMiddleware, getAllHistory);
router.get("/:id", JWTMiddleware, getHistory);

export default router;