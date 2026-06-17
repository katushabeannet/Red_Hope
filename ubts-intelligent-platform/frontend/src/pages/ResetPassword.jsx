import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RiLockLine, RiShieldCheckLine } from "react-icons/ri";

import { resetPassword } from "../services/authService";

function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.new_password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ uid, token, new_password: formData.new_password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Reset link is invalid or has expired. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white px-6 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950">
            <RiShieldCheckLine size={28} className="text-red-700 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enter your new password below.
          </p>
        </div>

        {done ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              Password reset successfully
            </p>
            <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">
              Redirecting you to the login page...
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-sm font-semibold text-red-700 hover:underline dark:text-red-400"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
                <RiLockLine className="text-slate-400" />
                <input
                  type="password"
                  value={formData.new_password}
                  onChange={(e) =>
                    setFormData({ ...formData, new_password: e.target.value })
                  }
                  required
                  placeholder="Min 8 characters"
                  className="w-full bg-transparent p-3 text-sm text-slate-900 outline-none dark:text-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
                <RiLockLine className="text-slate-400" />
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) =>
                    setFormData({ ...formData, confirm_password: e.target.value })
                  }
                  required
                  placeholder="Repeat password"
                  className="w-full bg-transparent p-3 text-sm text-slate-900 outline-none dark:text-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Link expired?{" "}
              <Link
                to="/forgot-password"
                className="font-semibold text-red-700 hover:text-red-800 dark:text-red-400"
              >
                Request a new one
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
