import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import { calculateStreak } from "../utils/streakCalculator.js";

export async function markComplete(req, res) {
  const { habitId } = req.body;
  const date = req.body.date || new Date().toISOString().slice(0, 10);
  const habit = await Habit.findOne({ _id: habitId, user: req.user._id });
  if (!habit) {
    res.status(404);
    throw new Error("Habit not found");
  }

  const log = await HabitLog.findOneAndUpdate(
    { habit: habitId, date },
    { habit: habitId, user: req.user._id, date, completed: true },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  res.status(201).json(log);
}

export async function toggleLog(req, res) {
  const { habitId } = req.body;
  const date = req.body.date || new Date().toISOString().slice(0, 10);
  const habit = await Habit.findOne({ _id: habitId, user: req.user._id });
  if (!habit) {
    res.status(404);
    throw new Error("Habit not found");
  }

  const existingLog = await HabitLog.findOne({ habit: habitId, user: req.user._id, date });
  if (existingLog) {
    await existingLog.deleteOne();
    return res.json({ completed: false });
  }
  await HabitLog.create({ habit: habitId, user: req.user._id, date, completed: true });
  return res.json({ completed: true });
}

export async function getLogs(req, res) {
  const habit = await Habit.findOne({ _id: req.params.habitId, user: req.user._id });
  if (!habit) {
    res.status(404);
    throw new Error("Habit not found");
  }

  const dateFilter = {};
  if (req.query.from) dateFilter.$gte = req.query.from;
  if (req.query.to) dateFilter.$lte = req.query.to;
  if (dateFilter.$gte && dateFilter.$lte && dateFilter.$gte > dateFilter.$lte) {
    res.status(400);
    throw new Error("From date must be on or before to date");
  }
  const query = { habit: habit._id, user: req.user._id };
  if (Object.keys(dateFilter).length) query.date = dateFilter;

  const [logs, allCompletedLogs] = await Promise.all([
    HabitLog.find(query).sort({ date: 1 }),
    HabitLog.find({ habit: habit._id, user: req.user._id, completed: true }).select("date"),
  ]);
  const { currentStreak, longestStreak } = calculateStreak(
    allCompletedLogs.map((log) => log.date),
  );
  res.json({ logs, currentStreak, longestStreak });
}
