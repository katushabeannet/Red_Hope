import { motion } from "framer-motion";

function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-[var(--crimson)] text-white hover:bg-[var(--crimson-dark)]",
    secondary:
      "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] hover:border-[var(--text-muted)]",
    outline:
      "border border-[var(--crimson)] text-[var(--crimson)] hover:bg-[var(--crimson-light)]",
    ghost:
      "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
    danger:
      "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </motion.button>
  );
}

export default Button;