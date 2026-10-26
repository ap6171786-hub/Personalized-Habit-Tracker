import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f8f9f6]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-7xl px-5 pb-8 text-center text-xs text-slate-400 sm:px-8">
        Small steps, repeated daily. <span className="text-emerald-700">That’s how change grows.</span>
      </footer>
    </div>
  );
}
