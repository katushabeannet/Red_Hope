import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RiHeartPulseLine,
  RiLockLine,
  RiMailLine,
  RiPhoneLine,
  RiUserHeartLine,
} from "react-icons/ri";

import { registerUser } from "../services/authService";
import { createDonorProfile } from "../services/donorService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    date_of_birth: "",
    gender: "Male",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const registerData = await registerUser({
        email: formData.email,
        username: formData.email.split("@")[0],
        full_name: formData.full_name,
        password: formData.password,
        role: "DONOR",
      });

      const loggedInUser = registerData.user || registerData;
      login(loggedInUser);

      await createDonorProfile({
        phone_number: formData.phone_number,
        blood_group: "O+",
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address,
      });

      showToast({
        type: "success",
        title: "Registration Successful",
        message: "Your donor account has been created successfully.",
      });

      navigate("/donor-dashboard");
    } catch (err) {
      showToast({
        type: "error",
        title: "Registration Failed",
        message:
          err.response?.data?.email?.[0] ||
          err.response?.data?.username?.[0] ||
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Registration failed. Please check your details.",
      });
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
            <RiUserHeartLine size={30} />
          </div>

          <h1 className="max-w-lg text-4xl font-extrabold leading-tight">
            Join Uganda&apos;s life-saving donor network.
          </h1>

          <p className="mt-5 max-w-md text-white/80">
            Create your donor account and start using intelligent blood donation
            support tools. You can complete detailed health assessments later
            from your donor dashboard.
          </p>
        </div>

        <div className="relative grid gap-4">
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-2xl font-bold">Quick Registration</p>
            <p className="mt-1 text-sm text-white/75">
              Create your donor account in less than a minute.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xl font-bold">AI</p>
              <p className="mt-1 text-xs text-white/75">
                Eligibility support
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xl font-bold">Geo</p>
              <p className="mt-1 text-xs text-white/75">
                Nearest camp finder
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Donor Registration
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
              Create Donor Account
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Enter your personal details to register as a donor.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              icon={<RiUserHeartLine />}
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <Field
              icon={<RiMailLine />}
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />

            <Field
              icon={<RiLockLine />}
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />

            <Field
              icon={<RiPhoneLine />}
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="0700000000"
              required
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Date of Birth"
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />

              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={["Male", "Female", "Other"]}
              />
            </div>

            <Field
              icon={<RiHeartPulseLine />}
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Kampala, Uganda"
              required
            />

            <button
              disabled={loading}
              className="w-full rounded-xl bg-red-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Donor Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-red-700 hover:text-red-800 dark:text-red-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  icon,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
        {icon && <span className="text-slate-400">{icon}</span>}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent p-3 text-sm text-slate-900 outline-none dark:text-slate-50"
        />
      </div>
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Register;