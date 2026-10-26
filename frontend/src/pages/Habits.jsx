import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Check, CirclePlus, Clock3, Pencil, Sparkles, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import HabitModal from "../components/HabitModal.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const loadHabits = useCallback(async () => {
    try {
      const { data } = await api.get("/habits");
      setHabits(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load your habits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHabits(); }, [loadHabits]);

  async function saveHabit(form) {
    setSaving(true);
    try {
      if (editingHabit) await api.put(`/habits/${editingHabit._id}`, form);
      else await api.post("/habits", form);
      toast.success(editingHabit ? "Habit updated" : "Habit created");
      setModalOpen(false);
      setEditingHabit(null);
      await loadHabits();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save habit");
    } finally {
      setSaving(false);
    }
  }

  async function toggleHabit(habit) {
    try {
      const { data } = await api.post("/logs/toggle", { habitId: habit._id });
      setHabits((current) => current.map((item) => item._id === habit._id ? { ...item, todayCompleted: data.completed } : item));
      toast.success(data.completed ? "A little progress, every day." : "Today’s check-in was removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update habit");
    }
  }

  async function deleteHabit(habit) {
    if (!window.confirm(`Delete “${habit.name}” and its progress history?`)) return;
    try {
      await api.delete(`/habits/${habit._id}`);
      setHabits((current) => current.filter((item) => item._id !== habit._id));
      toast.success("Habit deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete habit");
    }
  }

  function openModal(habit = null) {
    setEditingHabit(habit);
    setModalOpen(true);
  }

  if (loading) return <Spinner label="Finding your habits..." />;

  return (
    <div>
      <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Consistency over intensity</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Your habits<span className="text-emerald-700">.</span></h1>
          <p className="mt-2 text-sm text-slate-500">Make the things that matter part of your everyday.</p>
        </div>
        <button onClick={() => openModal()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800">
          <CirclePlus size={18} /> Add a habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-emerald-200 bg-emerald-50/60 px-6 py-16 text-center">
          <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm"><Sparkles size={25} /></span>
          <h2 className="text-xl font-extrabold text-slate-900">No habits yet. Create your first habit!</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Start with one small action you can repeat. Your AI coach will help you find a rhythm that sticks.</p>
          <button onClick={() => openModal()} className="mt-6 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">Create your first habit</button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {habits.map((habit, index) => (
            <article key={habit._id} className="group rounded-[26px] border border-slate-200/70 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5">
              <div className="mb-6 flex items-start justify-between">
                <span className={`grid size-11 place-items-center rounded-2xl ${["bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-sky-100 text-sky-700"][index % 3]}`}><Sparkles size={19} /></span>
                <div className="flex gap-1">
                  <button onClick={() => openModal(habit)} aria-label={`Edit ${habit.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={16} /></button>
                  <button onClick={() => deleteHabit(habit)} aria-label={`Delete ${habit.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <Link to={`/habits/${habit._id}`} className="group/title inline-flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{habit.name}</h2>
                <ArrowUpRight size={16} className="text-slate-300 transition group-hover/title:text-emerald-700" />
              </Link>
              <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">{habit.description || "A good habit, one day at a time."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-600"><Clock3 size={13} /> {habit.frequency}</span>
                {habit.goal && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">{habit.goal} goal</span>}
              </div>
              <button onClick={() => toggleHabit(habit)} className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${habit.todayCompleted ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "bg-slate-900 text-white hover:bg-emerald-800"}`}>
                <Check size={17} strokeWidth={2.5} /> {habit.todayCompleted ? "Done for today" : "Mark today"}
              </button>
            </article>
          ))}
        </div>
      )}
      {modalOpen && <HabitModal habit={editingHabit} onClose={() => { setModalOpen(false); setEditingHabit(null); }} onSave={saveHabit} saving={saving} />}
    </div>
  );
}
