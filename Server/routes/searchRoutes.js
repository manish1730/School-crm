import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { globalSearch } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", authMiddleware, globalSearch);

export default router;
