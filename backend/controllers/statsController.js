import axios from "axios";
import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import { calculateStreak } from "../utils/streakCalculator.js";

const dateString = (date) => date.toISOString().slice(0, 10);

export async function getStats(req, res) {
  const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  const habitIds = habits.map((habit) => habit._id);
  const allLogs = await HabitLog.aggregate([
    {
      $match: {
        user: req.user._id,
        habit: { $in: habitIds },
        completed: true,
      },
    },
    {
      $group: {
        _id: { habit: "$habit", date: "$date" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        habit: "$_id.habit",
        date: "$_id.date",
        count: 1,
      },
    },
  ]);

  const today = dateString(new Date());
  const todayDate = new Date();
  todayDate.setUTCHours(0, 0, 0, 0);
  const dates = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(todayDate);
    date.setUTCDate(date.getUTCDate() - (29 - index));
    return dateString(date);
  });
  const dailyCounts = new Map(dates.map((date) => [date, 0]));
  const logsByHabit = new Map(habitIds.map((id) => [id.toString(), []]));

  for (const log of allLogs) {
    const id = log.habit.toString();
    logsByHabit.get(id)?.push(log.date);
    if (dailyCounts.has(log.date)) {
      dailyCounts.set(log.date, dailyCounts.get(log.date) + log.count);
    }
  }

  const habitStats = habits.map((habit) => {
    const completedDates = logsByHabit.get(habit._id.toString()) || [];
    const { currentStreak, longestStreak } = calculateStreak(completedDates);
    const daysSinceCreated = Math.max(
      1,
      Math.floor((Date.now() - new Date(habit.createdAt).getTime()) / 86_400_000) + 1,
    );
    return {
      habitId: habit._id,
      name: habit.name,
      currentStreak,
      longestStreak,
      completionRate: Math.min(100, Math.round((completedDates.length / daysSinceCreated) * 100)),
    };
  });

  res.json({
    totalHabits: habits.length,
    completedToday: dailyCounts.get(today) || 0,
    longestStreak: Math.max(0, ...habitStats.map((habit) => habit.longestStreak)),
    weeklyData: dates.slice(-7).map((date) => ({ date, completed: dailyCounts.get(date) })),
    monthlyData: dates.map((date) => ({ date, completed: dailyCounts.get(date) })),
    habitStats,
  });
}

export async function getRecommendations(req, res) {
  const habits = await Habit.find({ user: req.user._id }).lean();
  const logs = await HabitLog.find({ user: req.user._id }).select("habit date completed").lean();
  try {
    const response = await axios.post(
      `${process.env.ML_SERVICE_URL || "http://localhost:8000"}/recommend`,
      {
        habits: habits.map(({ _id, name, createdAt }) => ({
          id: _id.toString(),
          name,
          createdAt,
        })),
        logs: logs.map(({ habit, date, completed }) => ({
          habitId: habit.toString(),
          date,
          completed,
        })),
      },
      { timeout: 10_000 },
    );
    res.json(response.data);
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    res.status(error.response ? 502 : 503);
    throw new Error(error.response
      ? "AI recommendation service failed to process the request"
      : "AI recommendation service is unavailable");
  }
}
