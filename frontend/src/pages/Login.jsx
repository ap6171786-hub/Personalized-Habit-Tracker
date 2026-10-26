import { useState } from "react";
import { Activity, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back. Let’s make today count.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-background grid min-h-screen place-items-center px-4 py-12">
      <section className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl sm:p-10">
        <Link to="/" className="mb-9 inline-flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-700 text-white"><Activity size={21} /></span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">habitly<span className="text-emerald-700">.</span></span>
        </Link>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Your next chapter starts here</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Good to see you.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Sign in and pick up where your progress left off.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm font-bold text-slate-700">
            Email address
            <span className="relative mt-2 block">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="field pl-11" disabled={loading} />
            </span>
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Password
            <span className="relative mt-2 block">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input type="password" required minLength={6} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" className="field pl-11" disabled={loading} />
            </span>
          </label>
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:opacity-60">
            {loading ? "Loading..." : <>Sign in <ArrowRight size={17} /></>}
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-500">New to Habitly? <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-900">Create an account</Link></p>
      </section>
      <p className="absolute bottom-5 text-xs font-medium text-slate-500/80">Build a life you feel good waking up to.</p>
    </main>
  );
}
