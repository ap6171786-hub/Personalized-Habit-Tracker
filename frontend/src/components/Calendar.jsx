import { ChevronLeft, ChevronRight } from "lucide-react";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar({ year, month, completedDates, onPrevious, onNext }) {
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const today = new Date().toISOString().slice(0, 10);
  const monthTitle = new Date(Date.UTC(year, month, 1)).toLocaleString("en", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900">{monthTitle}</h3>
        <div className="flex gap-1">
          <button onClick={onPrevious} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Previous month"><ChevronLeft size={17} /></button>
          <button onClick={onNext} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Next month"><ChevronRight size={17} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day) => <span key={day} className="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{day}</span>)}
        {cells.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} />;
          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const done = completedDates.has(date);
          return (
            <span key={date} className={`grid aspect-square place-items-center rounded-xl text-sm font-semibold ${done ? "bg-emerald-600 text-white" : "text-slate-600"} ${date === today ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}>
              {day}
            </span>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-emerald-600" /> Completed</span>
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-full ring-2 ring-amber-400" /> Today</span>
      </div>
    </div>
  );
}
