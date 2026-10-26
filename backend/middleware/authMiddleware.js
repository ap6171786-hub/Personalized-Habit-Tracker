import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  let decoded;
  try {
    decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error("Token invalid");
  }

  req.user = await User.findById(decoded.id).select("-password");
  if (!req.user) {
    res.status(401);
    throw new Error("Token invalid");
  }
  next();
});
