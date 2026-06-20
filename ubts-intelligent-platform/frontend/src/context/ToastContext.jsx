import { createContext, useContext, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
} from "react-icons/ri";

const ToastContext = createContext();

const DURATIONS = { success: 3500, info: 5000, error: 7000 };

const TOAST_STYLES = {
  success: {
    icon:   RiCheckboxCircleLine,
    accent: "var(--green)",
    iconBg: "#DCFCE7",
    border: "#BBF7D0",
    barBg:  "#D1FAE5",
  },
  info: {
    icon:   RiInformationLine,
    accent: "var(--blue)",
    iconBg: "#DBEAFE",
    border: "#BFDBFE",
    barBg:  "#EFF6FF",
  },
  error: {
    icon:   RiErrorWarningLine,
    accent: "var(--cr)",
    iconBg: "#FDEEF1",
    border: "#FECACA",
    barBg:  "#FEE2E2",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ type = "info", title, message }) => {
    const id       = Date.now() + Math.random();
    const duration = DURATIONS[type] || DURATIONS.info;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div style={{
        position: "fixed", right: 20, top: 20, zIndex: 9999,
        width: 360, display: "flex", flexDirection: "column", gap: 10,
        pointerEvents: "none",
      }}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }) {
  const cfg  = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = cfg.icon;
  const defaultTitle =
    toast.type === "success" ? "Success"
    : toast.type === "error" ? "Error"
    : "Information";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      border: `1.5px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.accent}`,
      boxShadow: "0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.05)",
      overflow: "hidden",
      pointerEvents: "all",
      animation: "toast-slide-in .28s cubic-bezier(.16,1,.3,1)",
    }}>
      {/* Content row */}
      <div style={{ display: "flex", gap: 14, padding: "14px 14px 16px", alignItems: "flex-start" }}>
        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: cfg.iconBg, color: cfg.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={21} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", margin: 0 }}>
            {toast.title || defaultTitle}
          </h4>
          {toast.message && (
            <p style={{ fontSize: 12, color: "var(--ink-s)", margin: "5px 0 0", lineHeight: 1.55 }}>
              {toast.message}
            </p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => onClose(toast.id)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--ink-l)", padding: "3px 3px 0", borderRadius: 6,
            flexShrink: 0, lineHeight: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-l)"; }}
        >
          <RiCloseLine size={17} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: cfg.barBg }}>
        <div style={{
          height: "100%",
          background: cfg.accent,
          animation: `toast-progress ${toast.duration}ms linear forwards`,
        }} />
      </div>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
