# Habitly — Personalized Habit Tracker

Habitly helps you build routines with secure habit tracking, progress visualizations, and an AI coach that learns from your check-ins to estimate completion likelihood and suggest a manageable next step.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Recharts
- **API:** Node.js, Express, MongoDB/Mongoose, JWT, bcrypt
- **AI recommendations:** Python, FastAPI, Pandas, scikit-learn Logistic Regression

## Project structure

```text
backend/       Express API, MongoDB models, auth, habits, logs, stats
frontend/      Vite React application
ml-service/    FastAPI recommendation model
```

## Requirements

- Node.js 20+
- MongoDB 6+
- Python 3.10+

## Setup

### 1. Backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

Set `MONGO_URI` and `JWT_SECRET` in `backend/.env`. The API runs on `http://localhost:5000` by default. Keep the JWT secret private and use a unique, strong value outside local development.

### 2. AI recommendation service

```powershell
cd ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The Node API calls this service at `http://localhost:8000`. Set `ML_SERVICE_URL` in `backend/.env` to change the service URL. Recommendations are core dashboard functionality; the dashboard reports an explicit error and retry action if the service is unreachable.

### 3. Frontend

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The Vite app runs on `http://localhost:5173`. Set `VITE_API_URL` in `frontend/.env` when the API is hosted elsewhere.

## Environment variables

| Variable | Service | Description |
| --- | --- | --- |
| `PORT` | Backend | API port; defaults to `5000` |
| `MONGO_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret used to sign access tokens |
| `JWT_EXPIRES_IN` | Backend | JWT lifetime; defaults to `7d` |
| `ML_SERVICE_URL` | Backend | Base URL for the required recommendation service |
| `VITE_API_URL` | Frontend | API base URL; defaults to `http://localhost:5000/api` |

## API endpoints

All habit, log, and stats endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Get the authenticated user |
| `GET` | `/api/habits` | List the user's habits and today's completion state |
| `POST` | `/api/habits` | Create a habit |
| `GET` | `/api/habits/:id` | Get a habit |
| `PUT` | `/api/habits/:id` | Update a habit |
| `DELETE` | `/api/habits/:id` | Delete a habit and its logs |
| `POST` | `/api/logs` | Mark a habit complete for a date |
| `POST` | `/api/logs/toggle` | Toggle a habit completion |
| `GET` | `/api/logs/:habitId` | Get habit logs and streaks; accepts optional `from` and `to` dates |
| `GET` | `/api/stats` | Get dashboard totals and time series |
| `GET` | `/api/stats/recommend` | Get AI predictions and personalized suggestions |
| `GET` | `/api/health` | Check API availability |
| `GET` | `http://localhost:8000/health` | Check recommendation service availability |
| `POST` | `http://localhost:8000/recommend` | Generate habit recommendations |

## Tests

```powershell
cd backend
npm test
```

The backend tests use `mongodb-memory-server`. Run the recommendation service tests from `ml-service`:

```powershell
pytest
```

## Screenshots

Screenshots can be added here after running the app locally.
