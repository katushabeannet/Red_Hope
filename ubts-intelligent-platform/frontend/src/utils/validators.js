const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
// Uganda: +256 or 0, then 7x or 8x (9 more digits)
const PHONE_RE = /^(\+256|0)[78]\d{8}$/;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const v = {
  required: (val, label = "This field") =>
    (val ?? "").toString().trim() ? null : `${label} is required.`,

  email: (val) =>
    EMAIL_RE.test((val || "").trim()) ? null : "Enter a valid email address.",

  phone: (val) => {
    const clean = (val || "").replace(/[\s\-()]/g, "");
    return PHONE_RE.test(clean) ? null
      : "Enter a valid Ugandan phone number (e.g. +256700123456 or 0700123456).";
  },

  minLen: (val, n, label = "This field") =>
    (val || "").length >= n ? null : `${label} must be at least ${n} characters.`,

  maxLen: (val, n, label = "This field") =>
    (val || "").length <= n ? null : `${label} must be at most ${n} characters.`,

  minNum: (val, n, label = "Value") =>
    Number(val) >= n ? null : `${label} must be at least ${n}.`,

  maxNum: (val, n, label = "Value") =>
    Number(val) <= n ? null : `${label} must be at most ${n}.`,

  latitude: (val) => {
    const n = Number(val);
    return !isNaN(n) && n >= -90 && n <= 90 ? null
      : "Latitude must be between -90 and 90.";
  },

  longitude: (val) => {
    const n = Number(val);
    return !isNaN(n) && n >= -180 && n <= 180 ? null
      : "Longitude must be between -180 and 180.";
  },

  bloodGroup: (val) =>
    BLOOD_GROUPS.includes(val) ? null : "Select a valid blood group.",

  minAge: (dob, years = 18) => {
    if (!dob) return "Date of birth is required.";
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - years);
    return new Date(dob) <= cutoff ? null
      : `You must be at least ${years} years old.`;
  },

  notFuture: (val, label = "Date") =>
    val && new Date(val) <= new Date() ? null
      : `${label} cannot be in the future.`,

  notPast: (val, label = "Date") =>
    val && new Date(val) >= new Date(new Date().toDateString()) ? null
      : `${label} cannot be in the past.`,

  endAfterStart: (start, end) =>
    !start || !end || new Date(end) >= new Date(start) ? null
      : "End date must be on or after the start date.",

  password: (val) => {
    if (!val || val.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(val)) return "Must include at least one uppercase letter.";
    if (!/[0-9]/.test(val)) return "Must include at least one number.";
    return null;
  },

  smsLen: (val) => {
    const len = (val || "").length;
    return len <= 160 ? null : `SMS must be ≤ 160 characters (currently ${len}).`;
  },

  name: (val, label = "Name") => {
    const t = (val || "").trim();
    if (!t) return `${label} is required.`;
    if (t.length < 2) return `${label} must be at least 2 characters.`;
    if (t.length > 100) return `${label} must be at most 100 characters.`;
    if (!/^[a-zA-Z\s'\-\.]+$/.test(t))
      return `${label} may only contain letters, spaces, hyphens, and apostrophes.`;
    return null;
  },
};

// Run checks and return first non-null error message
export function firstError(...checks) {
  for (const err of checks) {
    if (err) return err;
  }
  return null;
}
