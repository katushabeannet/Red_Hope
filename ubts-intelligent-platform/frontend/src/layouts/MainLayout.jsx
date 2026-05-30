import { Link, Outlet } from "react-router-dom";

function MainLayout() {
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

          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/" className="hover:text-red-200">Home</Link>
            <Link to="/chatbot" className="hover:text-red-200">Chatbot</Link>
            <Link to="/login" className="hover:text-red-200">Login</Link>
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