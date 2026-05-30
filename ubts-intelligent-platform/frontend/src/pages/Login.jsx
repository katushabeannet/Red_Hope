import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(formData);

      const loggedInUser = data.user || data;

      login(loggedInUser);

      if (loggedInUser.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/donor-dashboard");
      }
    } catch (err) {
      console.error(err);

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
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow">
      <h2 className="mb-2 text-3xl font-bold text-slate-900">
        Welcome Back
      </h2>

      <p className="mb-6 text-slate-600">
        Sign in to access your UBTS account.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:border-red-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:border-red-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-700 px-4 py-3 font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-400"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">Sample Accounts</p>

        <div className="mt-2">
          <p>
            <strong>Admin:</strong> admin@ubts.test
          </p>
          <p>Password: admin123</p>
        </div>

        <div className="mt-3">
          <p>
            <strong>Donor:</strong> donor@ubts.test
          </p>
          <p>Password: donor123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;