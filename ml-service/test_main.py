from datetime import date, timedelta

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_recommendations_return_personalized_habit_metadata():
    today = date.today()
    response = client.post("/recommend", json={
        "habits": [{"id": "reading", "name": "Read", "createdAt": (today - timedelta(days=10)).isoformat()}],
        "logs": [
            {"habitId": "reading", "date": (today - timedelta(days=offset)).isoformat(), "completed": True}
            for offset in range(1, 6)
        ],
    })

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["recommendations"]) == 1
    recommendation = payload["recommendations"][0]
    assert recommendation["habitId"] == "reading"
    assert recommendation["name"] == "Read"
    assert 0 <= recommendation["probability"] <= 1
    assert recommendation["bestWeekday"] is not None
    assert recommendation["averageStreak"] > 0
    assert recommendation["suggestion"]


def test_empty_account_returns_empty_recommendations():
    response = client.post("/recommend", json={"habits": [], "logs": []})
    assert response.json() == {"recommendations": [], "focusHabits": []}
