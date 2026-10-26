import { Router } from "express";
import { body, validationResult } from "express-validator";
import { getMe, loginUser, registerUser } from "../controllers/authController.js";
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

router.post(
  "/register",
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validate,
  asyncHandler(registerUser),
);
router.post(
  "/login",
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
  asyncHandler(loginUser),
);
router.get("/me", protect, asyncHandler(getMe));

export default router;
