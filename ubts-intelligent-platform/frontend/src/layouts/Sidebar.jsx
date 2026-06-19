import { NavLink, useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiUserLine,
  RiNotification3Line,
  RiHeartPulseLine,
  RiGroupLine,
  RiMegaphoneLine,
  RiMapPinLine,
  RiBarChart2Line,
  RiMessage2Line,
  RiWhatsappLine,
  RiAlertLine,
  RiLogoutBoxLine,
  RiDropLine,
  RiCloseLine,
} from "react-icons/ri";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const displayName = user?.full_name || user?.username || user?.email || "User";

  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems =
    user?.role === "ADMIN"
      ? [
          { to: "/admin-dashboard", label: "Dashboard", icon: RiDashboardLine },
          { to: "/admin-donors", label: "Donor Management", icon: RiGroupLine },
          { to: "/personalized-campaign", label: "Campaign Targeting", icon: RiMegaphoneLine },
          { to: "/admin-camps", label: "Manage Camps", icon: RiMapPinLine },
          { to: "/campaign-history", label: "Campaign History", icon: RiBarChart2Line },
          { to: "/admin-sms", label: "SMS Management", icon: RiMessage2Line },
          { to: "/admin-whatsapp", label: "WhatsApp", icon: RiWhatsappLine },
          { to: "/admin-blood-demand", label: "Blood Demand", icon: RiAlertLine },
          { to: "/notifications", label: "Notifications", icon: RiNotification3Line },
        ]
      : [
          { to: "/donor-dashboard", label: "Dashboard", icon: RiDashboardLine },
          { to: "/my-profile", label: "My Profile", icon: RiUserLine },
          { to: "/blood-demand-alerts", label: "Blood Alerts", icon: RiHeartPulseLine },
          { to: "/notifications", label: "Notifications", icon: RiNotification3Line },
        ];

  const handleLogout = async () => {
    await logout();

    showToast({
      type: "info",
      title: "Logged Out",
      message: "You have successfully signed out.",
    });

    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-red-700 to-red-500 text-white shadow-xl shadow-red-700/25"
        : "text-slate-600 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
    }`;

  return (
    <>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[290px] flex-col border-r border-white/60 bg-white/90 shadow-2xl shadow-slate-200/70 backdrop-blur-2xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/30 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative overflow-hidden border-b border-slate-200/70 px-6 py-6 dark:border-slate-800">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-500/20 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-700 to-red-500 text-white shadow-lg shadow-red-600/30">
                <RiDropLine size={24} />
              </div>

              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  RedHope
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  UBTS Intelligent Platform
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl bg-slate-100 p-2 text-slate-600 lg:hidden dark:bg-slate-800 dark:text-slate-300"
            >
              <RiCloseLine size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 py-5">
          <div className="rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-rose-500 p-4 text-white shadow-xl shadow-red-700/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-100">
              {user?.role === "ADMIN" ? "Administrator" : "Blood Donor"}
            </p>
            <h2 className="mt-1 truncate text-base font-extrabold">
              {displayName}
            </h2>
            <p className="mt-1 text-xs text-red-100">
              Saving lives through intelligent retention.
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={linkClass}
            >
              <Icon size={20} className="transition group-hover:scale-110" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200/70 p-4 dark:border-slate-800">
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/80">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-700 dark:bg-red-950 dark:text-red-300">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                {displayName}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition duration-300 hover:-translate-y-0.5 hover:bg-red-700 hover:text-white hover:shadow-lg hover:shadow-red-700/25 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          >
            <RiLogoutBoxLine size={19} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;