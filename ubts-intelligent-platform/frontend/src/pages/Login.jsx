import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiLockLine,
  RiMailLine,
  RiShieldCheckLine,
} from "react-icons/ri";

import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(formData);
      const loggedInUser = data.user || data;

      login(loggedInUser);

      navigate(
        loggedInUser.role === "ADMIN" ? "/admin-dashboard" : "/donor-dashboard"
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-64px)] bg-white dark:bg-slate-900 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-red-700 to-red-900 px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <RiShieldCheckLine size={28} />
          </div>

          <h1 className="max-w-lg text-4xl font-extrabold leading-tight">
            Secure access to intelligent blood donation support.
          </h1>

          <p className="mt-5 max-w-md text-white/80">
            Sign in to check donor eligibility, view availability predictions,
            manage donation camps, or run campaign-ready donor intelligence.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {[
            ["AI", "Assisted donor workflows"],
            ["KG", "Neo4j traceability"],
            ["Geo", "Nearest camp finder"],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-bold">{title}</p>
              <p className="mt-1 text-xs text-white/75">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Welcome Back
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Enter your credentials to access your workspace.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
                <RiMailLine className="text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent p-3 text-sm text-slate-900 outline-none dark:text-slate-50"
                  placeholder="admin@ubts.test"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
                <RiLockLine className="text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent p-3 text-sm text-slate-900 outline-none dark:text-slate-50"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-slate-400"
                >
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-red-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <p className="font-semibold text-slate-900 dark:text-slate-50">
              Sample Accounts
            </p>
            <p className="mt-2">Admin: admin@ubts.test / admin123</p>
            <p>Donor: donor@ubts.test / donor123</p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            New donor?{" "}
            <Link
              to="/register"
              className="font-semibold text-red-700 hover:text-red-800 dark:text-red-400"
            >
              Create donor account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;