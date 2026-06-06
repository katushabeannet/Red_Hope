import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiLockLine, RiMailLine } from "react-icons/ri";

import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
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
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--crimson-light)] text-[var(--crimson)]">
            <RiLockLine size={26} />
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Sign in to access your UBTS workspace.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Email Address
            </label>
            <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3">
              <RiMailLine className="text-[var(--text-muted)]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent p-3 text-sm outline-none text-[var(--text-primary)]"
                placeholder="admin@ubts.test"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Password
            </label>
            <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3">
              <RiLockLine className="text-[var(--text-muted)]" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent p-3 text-sm outline-none text-[var(--text-primary)]"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 rounded-xl bg-[var(--surface-2)] p-4 text-xs text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">
            Sample Accounts
          </p>
          <p className="mt-2">Admin: admin@ubts.test / admin123</p>
          <p>Donor: donor@ubts.test / donor123</p>
        </div>
      </Card>
    </div>
  );
}

export default Login;