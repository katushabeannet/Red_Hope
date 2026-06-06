function Card({ children, className = "", noPad = false }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${
        noPad ? "" : "p-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;