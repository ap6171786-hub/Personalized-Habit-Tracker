from datetime import date, datetime, timedelta, timezone
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.linear_model import LogisticRegression

app = FastAPI(title="Habitly Recommendation Service", version="1.0.0")


class HabitInput(BaseModel):
    id: str
    name: str
    createdAt: Optional[datetime] = None


class LogInput(BaseModel):
    habitId: str
    date: date
    completed: bool = True


class RecommendRequest(BaseModel):
    habits: list[HabitInput] = Field(default_factory=list)
    logs: list[LogInput] = Field(default_factory=list)


WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _streak_length(completed_dates: set[date], ending_at: date) -> int:
    streak = 0
    cursor = ending_at
    while cursor in completed_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _features_for_day(
    completed_dates: set[date],
    target_date: date,
    best_weekday: Optional[int],
) -> list[float]:
    recent_start = target_date - timedelta(days=14)
    recent_days = [recent_start + timedelta(days=offset) for offset in range(14)]
    recent_rate = sum(day in completed_dates for day in recent_days) / 14
    yesterday_done = float(target_date - timedelta(days=1) in completed_dates)
    streak = _streak_length(completed_dates, target_date - timedelta(days=1))
    streak_strength = min(streak, 7) / 7
    best_day = float(best_weekday == target_date.weekday()) if best_weekday is not None else 0.0
    return [recent_rate, yesterday_done, streak_strength, best_day]


def _training_data(
    completed_dates: set[date],
    start_date: date,
    today: date,
    best_weekday: Optional[int],
) -> tuple[list[list[float]], list[int], list[float]]:
    rng = np.random.default_rng(42)
    synthetic_features = rng.uniform(0, 1, size=(800, 4))
    logits = (
        -1.0
        + 2.1 * synthetic_features[:, 0]
        + 0.9 * synthetic_features[:, 1]
        + 0.8 * synthetic_features[:, 2]
        + 0.35 * synthetic_features[:, 3]
    )
    probabilities = 1 / (1 + np.exp(-logits))
    labels = rng.binomial(1, probabilities).tolist()
    features = synthetic_features.tolist()
    weights = [1.0] * len(labels)

    cursor = max(start_date, today - timedelta(days=179))
    while cursor < today:
        features.append(_features_for_day(completed_dates, cursor, best_weekday))
        labels.append(int(cursor in completed_dates))
        weights.append(5.0)
        cursor += timedelta(days=1)
    return features, labels, weights


def _habit_recommendation(habit: HabitInput, logs: list[LogInput], today: date) -> dict:
    habit_logs = [log for log in logs if log.habitId == habit.id]
    completed_dates = {log.date for log in habit_logs if log.completed}
    weekday_counts = pd.Series([day.weekday() for day in completed_dates], dtype="int64")
    best_weekday = int(weekday_counts.value_counts().idxmax()) if not weekday_counts.empty else None
    start_date = habit.createdAt.date() if habit.createdAt else min(completed_dates, default=today)
    active_days = max(1, (today - start_date).days + 1)
    completion_rate = min(1.0, len(completed_dates) / active_days)

    ordered_dates = sorted(completed_dates)
    streaks = []
    run = 0
    previous = None
    for completed_day in ordered_dates:
        run = run + 1 if previous and completed_day == previous + timedelta(days=1) else 1
        streaks.append(run)
        previous = completed_day
    average_streak = float(np.mean(streaks)) if streaks else 0.0

    features, labels, weights = _training_data(completed_dates, start_date, today, best_weekday)
    model = LogisticRegression(max_iter=500, random_state=42)
    model.fit(features, labels, sample_weight=weights)
    probability = float(model.predict_proba([
        _features_for_day(completed_dates, today, best_weekday)
    ])[0][1])

    if best_weekday == today.weekday():
        suggestion = f"{WEEKDAYS[today.weekday()]} is one of your strongest days. Protect a little time for {habit.name.lower()}."
    elif completion_rate < 0.35:
        suggestion = f"Try making {habit.name.lower()} a two-minute starting point today. Easy starts build consistency."
    elif probability >= 0.65:
        suggestion = f"You have a good rhythm going. Keep {habit.name.lower()} simple and repeatable today."
    else:
        suggestion = f"Choose a specific moment for {habit.name.lower()} today, then make the first step small."

    return {
        "habitId": habit.id,
        "name": habit.name,
        "probability": round(probability, 4),
        "suggestion": suggestion,
        "completionRate": round(completion_rate, 4),
        "bestWeekday": WEEKDAYS[best_weekday] if best_weekday is not None else None,
        "averageStreak": round(average_streak, 2),
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/recommend")
def recommend(payload: RecommendRequest):
    today = datetime.now(timezone.utc).date()
    recommendations = [
        _habit_recommendation(habit, payload.logs, today)
        for habit in payload.habits
    ]
    recommendations.sort(key=lambda item: item["probability"], reverse=True)
    focus_habits = [
        item["name"]
        for item in sorted(recommendations, key=lambda item: item["probability"])[:3]
        if item["probability"] < 0.65
    ]
    return {"recommendations": recommendations, "focusHabits": focus_habits}
