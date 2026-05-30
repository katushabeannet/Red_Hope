import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-red-700 text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">UBTS Intelligent Platform</h1>
            <p className="text-sm text-red-100">
              Donor assistance and campaign planning
            </p>
          </div>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="hover:text-red-200">
              Home
            </Link>

            <Link to="/chatbot" className="hover:text-red-200">
              Chatbot
            </Link>

            {user?.role === "DONOR" && (
              <Link to="/donor-dashboard" className="hover:text-red-200">
                Donor Dashboard
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link to="/admin-dashboard" className="hover:text-red-200">
                Admin Dashboard
              </Link>
            )}

            {!user ? (
              <Link to="/login" className="hover:text-red-200">
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="rounded-lg bg-white px-3 py-1 text-red-700 hover:bg-red-100"
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