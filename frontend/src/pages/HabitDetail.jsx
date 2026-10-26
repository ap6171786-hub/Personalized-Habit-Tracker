import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Flame, LineChart as LineChartIcon, Target } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/axios.js";
import Calendar from "../components/Calendar.jsx";
import Spinner from "../components/Spinner.jsx";

export default function HabitDetail() {
  const { id } = useParams();
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = `${month.year}-${String(month.month + 1).padStart(2, "0")}-01`;
      const last = new Date(month.year, month.month + 1, 0).getDate();
      const to = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${last}`;
      const [habitResponse, logResponse] = await Promise.all([
        api.get(`/habits/${id}`),
        api.get(`/logs/${id}`, { params: { from, to } }),
      ]);
      setHabit(habitResponse.data);
      setLogs(logResponse.data.logs);
      setStreak({
        currentStreak: logResponse.data.currentStreak,
        longestStreak: logResponse.data.longestStreak,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load habit details");
    } finally {
      setLoading(false);
    }
  }, [id, month]);

  useEffect(() => { load(); }, [load]);

  const completedDates = useMemo(() => new Set(logs.filter((log) => log.completed).map((log) => log.date)), [logs]);
  const chartData = useMemo(() => {
    const byDate = new Map(logs.map((log) => [log.date, log.completed ? 1 : 0]));
    const days = new Date(month.year, month.month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const date = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return { date: String(day), completed: byDate.get(date) || 0 };
    });
  }, [logs, month]);

  async function toggleToday() {
    try {
      const { data } = await api.post("/logs/toggle", { habitId: id });
      toast.success(data.completed ? "Today is in the books." : "Today’s check-in was removed");
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update habit");
    }
  }

  function changeMonth(delta) {
    const next = new Date(month.year, month.month + delta, 1);
    setMonth({ year: next.getFullYear(), month: next.getMonth() });
  }

  if (loading && !habit) return <Spinner label="Loading your progress..." />;
  if (!habit) return <div className="py-16 text-center"><p className="font-bold text-slate-700">This habit could not be found.</p><Link to="/habits" className="mt-3 inline-block text-sm font-bold text-emerald-700">Back to habits</Link></div>;

  return (
    <div>
      <Link to="/habits" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-emerald-700"><ArrowLeft size={16} /> All habits</Link>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Your progress, in perspective</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{habit.name}<span className="text-emerald-700">.</span></h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{habit.description || `Your ${habit.frequency} practice, building one day at a time.`}</p>
        </div>
        <button onClick={toggleToday} className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 hover:bg-emerald-800">Check in today</button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600"><Flame size={22} /></span>
          <div><p className="text-2xl font-extrabold text-slate-900">{streak.currentStreak} <span className="text-sm font-bold text-slate-400">days</span></p><p className="text-xs font-semibold text-slate-500">Current streak</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Target size={22} /></span>
          <div><p className="text-2xl font-extrabold text-slate-900">{streak.longestStreak} <span className="text-sm font-bold text-slate-400">days</span></p><p className="text-xs font-semibold text-slate-500">Personal best</p></div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[26px] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
          <Calendar year={month.year} month={month.month} completedDates={completedDates} onPrevious={() => changeMonth(-1)} onNext={() => changeMonth(1)} />
        </section>
        <section className="rounded-[26px] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700"><LineChartIcon size={18} /></span>
            <div><h2 className="font-extrabold text-slate-900">Monthly rhythm</h2><p className="mt-1 text-xs text-slate-500">A green peak means you showed up.</p></div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 2, left: -20 }}>
                <CartesianGrid stroke="#eef1ed" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(value) => value ? "Done" : "—"} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip formatter={(value) => value ? "Completed" : "Not completed"} labelFormatter={(label) => `Day ${label}`} />
                <Line type="monotone" dataKey="completed" stroke="#13805b" strokeWidth={3} dot={{ r: 3, fill: "#13805b", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
