import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Flame, Heart, Sparkles, Target, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import api from "../api/axios.js";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function MetricCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <article className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between">
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span>
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{detail}</p>
    </article>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [focusHabits, setFocusHabits] = useState([]);
  const [recommendationError, setRecommendationError] = useState("");
  const [loading, setLoading] = useState(true);
  const [recommendationLoading, setRecommendationLoading] = useState(true);

  const loadRecommendations = useCallback(async () => {
    setRecommendationLoading(true);
    setRecommendationError("");
    try {
      const { data } = await api.get("/stats/recommend");
      setRecommendations(data.recommendations || []);
      setFocusHabits(data.focusHabits || []);
    } catch (error) {
      setRecommendationError(error.response?.data?.message || "Your AI coach is unavailable right now.");
    } finally {
      setRecommendationLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResponse, habitsResponse] = await Promise.all([
        api.get("/stats"),
        api.get("/habits"),
      ]);
      setStats(statsResponse.data);
      setHabits(habitsResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load your dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadRecommendations();
  }, [loadDashboard, loadRecommendations]);

  const progress = useMemo(() => {
    if (!stats?.totalHabits) return 0;
    return Math.round((stats.completedToday / stats.totalHabits) * 100);
  }, [stats]);

  async function toggleHabit(habit) {
    try {
      const { data } = await api.post("/logs/toggle", { habitId: habit._id });
      setHabits((current) => current.map((item) =>
        item._id === habit._id ? { ...item, todayCompleted: data.completed } : item,
      ));
      await loadDashboard();
      await loadRecommendations();
      toast.success(data.completed ? "Another promise kept." : "Today’s check-in was removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update habit");
    }
  }

  if (loading) return <Spinner label="Gathering your progress..." />;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[30px] bg-[#143f32] px-7 py-8 text-white shadow-xl shadow-emerald-950/10 sm:px-10 sm:py-10">
        <div className="absolute -right-14 -top-32 size-80 rounded-full border border-white/10" />
        <div className="absolute -right-2 -top-20 size-64 rounded-full border border-white/10" />
        <div className="relative max-w-2xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200"><Sparkles size={14} /> Your personal growth space</p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">A little better, <span className="text-emerald-200">{user?.name?.split(" ")[0]}.</span></h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-50/75">Progress isn’t about perfect days. It’s about showing up, learning your rhythm, and beginning again.</p>
          <Link to="/habits" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-emerald-900 transition hover:bg-emerald-50">Explore your habits <ArrowRight size={16} /></Link>
        </div>
        <div className="absolute bottom-9 right-10 hidden size-24 rotate-6 items-center justify-center rounded-[28px] border border-white/15 bg-white/10 text-emerald-100 backdrop-blur sm:flex"><Heart size={40} strokeWidth={1.4} /></div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Target} label="Total habits" value={stats?.totalHabits ?? 0} detail="Small steps, big change" tone="bg-sky-50 text-sky-700" />
        <MetricCard icon={Check} label="Completed today" value={`${stats?.completedToday ?? 0} / ${stats?.totalHabits ?? 0}`} detail="Every check-in counts" tone="bg-emerald-50 text-emerald-700" />
        <MetricCard icon={Flame} label="Best streak" value={`${stats?.longestStreak ?? 0}`} detail="days of showing up" tone="bg-amber-50 text-amber-700" />
        <MetricCard icon={TrendingUp} label="Today's progress" value={`${progress}%`} detail={progress === 100 && stats?.totalHabits ? "You showed up for all of them" : "Keep building your rhythm"} tone="bg-violet-50 text-violet-700" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <article className="rounded-[26px] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-end justify-between">
            <div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">The bigger picture</p><h2 className="text-lg font-extrabold text-slate-900">Your weekly momentum</h2></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Last 7 days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.weeklyData || []} margin={{ top: 5, right: 8, bottom: 0, left: -22 }}>
                <CartesianGrid stroke="#eef1ed" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(`${date}T00:00:00`).toLocaleDateString("en", { weekday: "short" })} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip labelFormatter={(date) => new Date(`${date}T00:00:00`).toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })} />
                <Bar dataKey="completed" fill="#16815b" radius={[7, 7, 2, 2]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-[26px] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-end justify-between">
            <div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Consistency, over time</p><h2 className="text-lg font-extrabold text-slate-900">30-day trend</h2></div>
            <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">30 days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyData || []} margin={{ top: 5, right: 8, bottom: 0, left: -22 }}>
                <CartesianGrid stroke="#eef1ed" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(date, index) => index % 5 === 0 ? new Date(`${date}T00:00:00`).getDate() : ""} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip labelFormatter={(date) => new Date(`${date}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" })} />
                <Line type="monotone" dataKey="completed" stroke="#3974b8" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[26px] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">One moment at a time</p><h2 className="text-lg font-extrabold text-slate-900">Today’s habits</h2></div>
            <Link to="/habits" className="text-sm font-bold text-emerald-700 hover:text-emerald-900">See all</Link>
          </div>
          {habits.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-5 py-8 text-center"><p className="text-sm font-bold text-slate-700">Your first habit is waiting.</p><Link to="/habits" className="mt-2 inline-block text-sm font-bold text-emerald-700">Create a habit <ArrowRight className="inline" size={14} /></Link></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {habits.slice(0, 5).map((habit) => (
                <div key={habit._id} className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0"><Link to={`/habits/${habit._id}`} className="truncate text-sm font-bold text-slate-800 hover:text-emerald-700">{habit.name}</Link><p className="mt-1 truncate text-xs text-slate-400">{habit.description || `${habit.frequency} practice`}</p></div>
                  <button onClick={() => toggleHabit(habit)} aria-label={`${habit.todayCompleted ? "Undo" : "Complete"} ${habit.name}`} className={`grid size-10 shrink-0 place-items-center rounded-xl transition ${habit.todayCompleted ? "bg-emerald-100 text-emerald-800" : "border border-slate-200 text-slate-300 hover:border-emerald-500 hover:text-emerald-700"}`}><Check size={18} strokeWidth={2.5} /></button>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-[26px] border border-emerald-900/10 bg-[#eaf4ed] p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-start justify-between">
            <div><p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-emerald-700">Powered by your progress</p><h2 className="text-lg font-extrabold text-slate-900">Your AI habit coach</h2></div>
            <span className="grid size-10 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm"><Sparkles size={19} /></span>
          </div>
          <p className="mb-5 text-sm leading-6 text-slate-600">Personalized predictions and gentle nudges, shaped by the routine you’re building.</p>
          {recommendationLoading ? (
            <div className="rounded-2xl bg-white/75 px-4 py-7 text-center text-sm font-semibold text-slate-500">Learning your rhythm...</div>
          ) : recommendationError ? (
            <div className="rounded-2xl border border-rose-200 bg-white/80 px-4 py-4">
              <p className="text-sm font-semibold text-rose-700">{recommendationError}</p>
              <button onClick={loadRecommendations} className="mt-3 text-xs font-extrabold text-emerald-800 underline underline-offset-4">Try again</button>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-2xl bg-white/75 px-4 py-5 text-sm leading-6 text-slate-600">Add a habit and check in over time. Your coach will learn from your progress and tailor its suggestions to you.</div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((item) => (
                <div key={item.habitId} className="rounded-2xl bg-white/85 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-extrabold text-slate-800">{item.name}</p>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">{Math.round(item.probability * 100)}% today</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{item.suggestion}</p>
                </div>
              ))}
            </div>
          )}
          {!recommendationLoading && !recommendationError && focusHabits.length > 0 && (
            <p className="mt-4 text-xs font-bold text-emerald-800">A little extra care today: {focusHabits.join(", ")}</p>
          )}
        </article>
      </section>
    </div>
  );
}
