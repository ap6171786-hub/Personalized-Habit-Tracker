import { Router } from "express";
import { getRecommendations, getStats } from "../controllers/statsController.js";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(protect);
router.get("/", asyncHandler(getStats));
router.get("/recommend", asyncHandler(getRecommendations));

export default router;
