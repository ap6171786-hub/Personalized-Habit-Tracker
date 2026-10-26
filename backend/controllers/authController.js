import jwt from "jsonwebtoken";
import User from "../models/User.js";

function createAuthResponse(user) {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
  return {
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  };
}

export async function registerUser(req, res) {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });
  res.status(201).json(createAuthResponse(user));
}

export async function loginUser(req, res) {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user || !(await user.matchPassword(req.body.password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  res.json(createAuthResponse(user));
}

export function getMe(req, res) {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
}
