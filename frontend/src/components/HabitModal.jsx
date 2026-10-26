import { useEffect, useState } from "react";
import { X } from "lucide-react";

const emptyForm = { name: "", description: "", goal: "", frequency: "daily" };

export default function HabitModal({ habit, onClose, onSave, saving }) {
  const [form, setForm] = useState(emptyForm);
  useEffect(() => {
    setForm(habit ? {
      name: habit.name || "",
      description: habit.description || "",
      goal: habit.goal || "",
      frequency: habit.frequency || "daily",
    } : emptyForm);
  }, [habit]);

  function submit(event) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="w-full max-w-lg rounded-[28px] bg-white p-7 shadow-2xl sm:p-9">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">{habit ? "Refine your routine" : "A fresh beginning"}</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{habit ? "Edit your habit" : "Create a habit"}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Close modal"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm font-bold text-slate-700">
            Habit name <span className="text-rose-500">*</span>
            <input required maxLength={60} autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Read for 20 minutes" className="field mt-2" />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Description
            <textarea maxLength={200} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this look like for you?" className="field mt-2 resize-none" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              Goal
              <input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. 30 days" className="field mt-2" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Frequency
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="field mt-2">
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
            <button disabled={saving} className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:opacity-60">
              {saving ? "Saving..." : habit ? "Save changes" : "Create habit"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
