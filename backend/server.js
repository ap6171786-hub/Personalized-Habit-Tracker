import "dotenv/config";
import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/stats", statsRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => app.listen(port, () => console.log(`API listening on port ${port}`)))
    .catch((error) => {
      console.error("Server startup failed:", error.message);
      process.exitCode = 1;
    });
}

export default app;
