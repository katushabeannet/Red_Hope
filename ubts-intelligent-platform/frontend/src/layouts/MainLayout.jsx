import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiDropLine,
  RiLogoutBoxLine,
  RiMapPinLine,
  RiMessage3Line,
  RiMoonLine,
  RiSunLine,
  RiUserHeartLine,
} from "react-icons/ri";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function MainLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const guestNavClass = ({ isActive }) =>
    isActive
      ? "text-[var(--crimson)] font-semibold"
      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white";

  const sideNavClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-[var(--crimson-light)] text-[var(--crimson)]"
        : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
    }`;

  const displayName = user?.full_name || user?.username || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-700">
                <RiDropLine className="text-white" size={18} />
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                UBTS Platform
              </span>
            </NavLink>

            <nav className="hidden items-center gap-8 lg:flex">
              <NavLink to="/" className={guestNavClass}>
                Home
              </NavLink>
              <NavLink to="/chatbot" className={guestNavClass}>
                Chatbot
              </NavLink>
              <NavLink to="/login" className={guestNavClass}>
                Login
              </NavLink>
            </nav>

            <button
              onClick={toggle}
              className="rounded-lg bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {dark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
            </button>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  const navItems =
    user.role === "ADMIN"
      ? [
          {
            to: "/admin-dashboard",
            label: "Dashboard",
            icon: RiDashboardLine,
          },
          {
            to: "/admin-camps",
            label: "Manage Camps",
            icon: RiMapPinLine,
          },
          {
            to: "/chatbot",
            label: "Chatbot",
            icon: RiMessage3Line,
          },
        ]
      : [
          {
            to: "/donor-dashboard",
            label: "Dashboard",
            icon: RiDashboardLine,
          },
          {
            to: "/chatbot",
            label: "Chatbot",
            icon: RiMessage3Line,
          },
        ];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-2)]">
      <aside className="hidden w-[260px] flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--crimson)]">
            <RiDropLine size={16} className="text-white" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              UBTS
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Intelligence Platform
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={sideNavClass}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] px-3 py-4">
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--crimson-light)]">
              <span className="text-xs font-semibold text-[var(--crimson)]">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {displayName}
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-red-50 hover:text-red-600"
          >
            <RiLogoutBoxLine size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:px-6">
          <div>
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">
              {user.role === "ADMIN" ? "Admin Workspace" : "Donor Workspace"}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Intelligent blood donation support system
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] sm:inline-flex">
              {user.role}
            </span>

            <button
              onClick={toggle}
              className="rounded-lg bg-[var(--surface-2)] p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {dark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-[var(--crimson)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--crimson-dark)] lg:hidden"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;