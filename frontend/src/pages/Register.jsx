import { useState } from "react";
import { Activity, ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Your passwords don’t match.");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Your new beginning starts now.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-background grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl sm:p-10">
        <Link to="/" className="mb-8 inline-flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-700 text-white"><Activity size={21} /></span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">habitly<span className="text-emerald-700">.</span></span>
        </Link>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Make space for better</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Start small. Grow steady.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Create your account and meet your personal AI habit coach.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Your name
            <span className="relative mt-2 block">
              <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" className="field pl-11" disabled={loading} />
            </span>
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Email address
            <span className="relative mt-2 block">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="field pl-11" disabled={loading} />
            </span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              Password
              <span className="relative mt-2 block">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="6+ characters" className="field pl-10" disabled={loading} />
              </span>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Confirm
              <input type="password" required minLength={6} autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat password" className="field mt-2" disabled={loading} />
            </label>
          </div>
          <button disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:opacity-60">
            {loading ? "Loading..." : <>Create account <ArrowRight size={17} /></>}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-900">Sign in</Link></p>
      </section>
    </main>
  );
}
