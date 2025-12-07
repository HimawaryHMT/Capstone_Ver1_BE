// src/routes/fallEventRoutes.js
import { Router } from "express";
import { createFallEvent } from "../controllers/fallEventController.js";
import { getAllFallEvents } from "../controllers/fallEventController.js";

const router = Router();

// POST /api/fall-events
router.post("/", createFallEvent);

router.get("/", getAllFallEvents)

export default router;