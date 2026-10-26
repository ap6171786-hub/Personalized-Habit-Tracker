import { useState } from "react";
import { Activity, CalendarDays, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/habits", label: "My habits", icon: CalendarDays },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#f8f9f6]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <NavLink to="/dashboard" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <span className="grid size-10 place-items-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/10">
            <Activity size={20} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">habitly<span className="text-emerald-700">.</span></span>
        </NavLink>

        <button className="rounded-xl p-2 text-slate-600 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className={`${menuOpen ? "absolute left-0 right-0 top-[75px] flex border-b border-slate-200 bg-[#f8f9f6] p-4 shadow-lg" : "hidden"} items-center gap-2 md:static md:flex md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${isActive ? "bg-emerald-50 text-emerald-800" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-800">{user?.name}</p>
            <p className="text-[11px] text-slate-400">Your growth space</p>
          </div>
          <span className="grid size-10 place-items-center rounded-full bg-amber-100 text-sm font-bold uppercase text-amber-800">
            {user?.name?.slice(0, 1)}
          </span>
          <button onClick={handleLogout} className="ml-1 rounded-xl p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" title="Log out" aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 md:hidden">
          <span className="text-sm font-semibold text-slate-600">{user?.name}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold text-rose-600">
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </header>
  );
}
