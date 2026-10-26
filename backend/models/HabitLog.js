import mongoose from "mongoose";

const habitLogSchema = new mongoose.Schema({
  habit: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: String, required: true },
  completed: { type: Boolean, default: true },
});

habitLogSchema.index({ habit: 1, date: 1 }, { unique: true });

export default mongoose.model("HabitLog", habitLogSchema);
