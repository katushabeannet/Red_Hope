import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    isActive
      ? "rounded-lg bg-white px-3 py-2 font-semibold text-red-700"
      : "rounded-lg px-3 py-2 hover:bg-red-600 hover:text-white";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-red-700 text-white shadow">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold">UBTS Intelligent Platform</h1>
            <p className="text-sm text-red-100">
              Donor assistance and campaign planning
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <NavLink to="/" className={navClass}>
              Home
            </NavLink>

            <NavLink to="/chatbot" className={navClass}>
              Chatbot
            </NavLink>

            {user?.role === "DONOR" && (
              <NavLink to="/donor-dashboard" className={navClass}>
                Donor Dashboard
              </NavLink>
            )}

            {user?.role === "ADMIN" && (
              <>
                <NavLink to="/admin-dashboard" className={navClass}>
                  Admin Dashboard
                </NavLink>

                <NavLink to="/admin-camps" className={navClass}>
                  Camps
                </NavLink>
              </>
            )}

            {!user ? (
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
            ) : (
              <button
                onClick={handleLogout}
                className="rounded-lg bg-white px-3 py-2 font-semibold text-red-700 hover:bg-red-100"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;