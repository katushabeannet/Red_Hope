const styles = {
  active:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
  completed:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  inactive:
    "border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
  eligible:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  ineligible:
    "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  donor: "border-red-200 bg-[var(--crimson-light)] text-[var(--crimson)]",
  admin: "border-amber-200 bg-amber-50 text-amber-700",
};

function Badge({ label, variant = "inactive", className = "" }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        styles[variant] || styles.inactive
      } ${className}`}
    >
      {label}
    </span>
  );
}

export default Badge;