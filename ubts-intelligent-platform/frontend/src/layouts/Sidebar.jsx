import { NavLink } from "react-router-dom";
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
  RiDropLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();

  const displayName = user?.full_name || user?.username || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems =
    user?.role === "ADMIN"
      ? [
          { to: "/admin-dashboard",     label: "Dashboard",         icon: RiDashboardLine },
          { to: "/admin-donors",         label: "Donor Management",  icon: RiGroupLine },
          { to: "/personalized-campaign",label: "Campaign Targeting",icon: RiMegaphoneLine },
          { to: "/admin-camps",          label: "Manage Camps",      icon: RiMapPinLine },
          { to: "/campaign-history",     label: "Campaign History",  icon: RiBarChart2Line },
          { to: "/admin-sms",            label: "SMS Management",    icon: RiMessage2Line },
          { to: "/admin-whatsapp",       label: "WhatsApp",          icon: RiWhatsappLine },
          { to: "/admin-blood-demand",   label: "Blood Demand",      icon: RiAlertLine },
          { to: "/notifications",        label: "Notifications",     icon: RiNotification3Line },
        ]
      : [
          { to: "/donor-dashboard",      label: "Dashboard",         icon: RiDashboardLine },
          { to: "/my-profile",           label: "My Profile",        icon: RiUserLine },
          { to: "/blood-demand-alerts",  label: "Blood Alerts",      icon: RiHeartPulseLine },
          { to: "/notifications",        label: "Notifications",     icon: RiNotification3Line },
        ];

  return (
    <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
      <a href="/" className="side-brand">
        <div className="side-brand-icon">
          <RiDropLine size={22} color="#fff" />
        </div>
        <div>
          <div className="side-brand-name">RedHope</div>
          <div className="side-brand-sub">UBTS Intelligent Platform</div>
        </div>
      </a>

      <nav className="side-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `side-link${isActive ? " active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="side-foot">
        <div className="side-avatar">{initials}</div>
        <div className="side-info">
          <div className="side-info-name">{displayName}</div>
          <div className="side-info-role">
            {user?.role === "ADMIN" ? "Administrator" : "Blood Donor"}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
