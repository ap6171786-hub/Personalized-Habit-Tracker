import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

export async function createHabit(req, res) {
  const habit = await Habit.create({ ...req.body, user: req.user._id });
  res.status(201).json(habit);
}

export async function getHabits(req, res) {
  const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  const today = new Date().toISOString().slice(0, 10);
  const completed = await HabitLog.find({
    user: req.user._id,
    habit: { $in: habits.map((habit) => habit._id) },
    date: today,
    completed: true,
  }).select("habit");
  const completedIds = new Set(completed.map((log) => log.habit.toString()));
  res.json(habits.map((habit) => ({
    ...habit,
    todayCompleted: completedIds.has(habit._id.toString()),
  })));
}

export async function getHabitById(req, res) {
  const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
  if (!habit) {
    res.status(404);
    throw new Error("Habit not found");
  }
  res.json(habit);
}

export async function updateHabit(req, res) {
  const updates = Object.fromEntries(
    ["name", "description", "goal", "frequency"]
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, req.body[field]]),
  );
  const habit = await Habit.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    updates,
    { new: true, runValidators: true },
  );
  if (!habit) {
    res.status(404);
    throw new Error("Habit not found");
  }
  res.json(habit);
}

export async function deleteHabit(req, res) {
  const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!habit) {
    res.status(404);
    throw new Error("Habit not found");
  }
  await HabitLog.deleteMany({ habit: habit._id, user: req.user._id });
  res.json({ success: true, message: "Habit deleted" });
}
