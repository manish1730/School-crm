import express from "express";
import { getAllMasterData } from "../controllers/masterController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all", authMiddleware, getAllMasterData);

export default router;
