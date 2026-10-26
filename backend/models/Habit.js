import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  description: { type: String, maxlength: 200, default: "" },
  goal: { type: String, default: "" },
  frequency: { type: String, enum: ["daily", "weekly"], default: "daily" },
  createdAt: { type: Date, default: Date.now },
});

habitSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Habit", habitSchema);
