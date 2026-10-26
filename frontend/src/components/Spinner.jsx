export default function Spinner({ fullScreen = false, label = "Loading" }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-sm text-slate-500 ${fullScreen ? "min-h-screen" : "py-12"}`}>
      <span className="size-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      <span>{label}</span>
    </div>
  );
}
