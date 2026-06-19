import { RiMenuLine, RiMoonLine, RiSunLine, RiSearchLine } from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Topbar({ setSidebarOpen }) {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();

  const workspaceTitle =
    user?.role === "ADMIN" ? "Admin Workspace" : "Donor Workspace";

  const subtitle =
    user?.role === "ADMIN"
      ? "Manage donors, campaigns, camps, and retention analytics."
      : "Track your donation journey, alerts, and personalized campaigns.";

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 shadow-sm shadow-slate-200/40 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-2xl bg-slate-100 p-3 text-slate-700 transition hover:bg-red-50 hover:text-red-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-white/10 lg:hidden"
          >
            <RiMenuLine size={22} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {workspaceTitle}
              </h2>

              <span className="hidden rounded-full bg-red-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-red-700 dark:bg-red-950 dark:text-red-300 sm:inline-flex">
                {user?.role}
              </span>
            </div>

            <p className="mt-1 hidden text-sm font-medium text-slate-500 dark:text-slate-400 md:block">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950 md:flex">
            <RiSearchLine className="text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-44 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
            />
          </div>

          <button
            onClick={toggle}
            className="rounded-2xl bg-slate-100 p-3 text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-white/10"
          >
            {dark ? <RiSunLine size={20} /> : <RiMoonLine size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;