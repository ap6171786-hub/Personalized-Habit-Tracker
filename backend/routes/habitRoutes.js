import { Router } from "express";
import { body, validationResult } from "express-validator";
import {
  createHabit,
  deleteHabit,
  getHabitById,
  getHabits,
  updateHabit,
} from "../controllers/habitController.js";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array()[0].msg));
  }
  return next();
};
const habitValidation = [
  body("name").trim().notEmpty().withMessage("Habit name is required")
    .isLength({ max: 60 }).withMessage("Habit name must be 60 characters or fewer"),
  body("description").optional().isLength({ max: 200 })
    .withMessage("Description must be 200 characters or fewer"),
  body("frequency").optional().isIn(["daily", "weekly"])
    .withMessage("Frequency must be daily or weekly"),
  validate,
];

router.use(protect);
router.route("/")
  .post(habitValidation, asyncHandler(createHabit))
  .get(asyncHandler(getHabits));
router.route("/:id")
  .get(asyncHandler(getHabitById))
  .put(habitValidation, asyncHandler(updateHabit))
  .delete(asyncHandler(deleteHabit));

export default router;
