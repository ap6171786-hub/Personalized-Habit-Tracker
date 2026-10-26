import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import { getLogs, markComplete, toggleLog } from "../controllers/logController.js";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
const validateHabitId = [
  body("habitId").isMongoId().withMessage("Valid habitId is required"),
  body("date").optional().isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Date must use YYYY-MM-DD format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    return next();
  },
];

router.use(protect);
router.post("/", validateHabitId, asyncHandler(markComplete));
router.post("/toggle", validateHabitId, asyncHandler(toggleLog));
router.get(
  "/:habitId",
  query("from").optional().isISO8601({ strict: true, strictSeparator: true })
    .withMessage("From date must use YYYY-MM-DD format"),
  query("to").optional().isISO8601({ strict: true, strictSeparator: true })
    .withMessage("To date must use YYYY-MM-DD format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    return next();
  },
  asyncHandler(getLogs),
);

export default router;
