import { createContext, useContext, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
} from "react-icons/ri";

const ToastContext = createContext();

const durations = {
  success: 3500,
  info: 5000,
  error: 7000,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ type = "info", title, message }) => {
    const id = Date.now() + Math.random();
    const duration = durations[type] || durations.info;

    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        title,
        message,
        duration,
      },
    ]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed right-5 top-5 z-[9999] w-full max-w-sm space-y-3">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }) {
  const styles = {
    success: {
      icon: RiCheckboxCircleLine,
      border: "border-emerald-200 dark:border-emerald-800",
      bg: "bg-white dark:bg-slate-900",
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30",
      bar: "bg-emerald-500",
      title: "Success",
    },
    info: {
      icon: RiInformationLine,
      border: "border-blue-200 dark:border-blue-800",
      bg: "bg-white dark:bg-slate-900",
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-900/30",
      bar: "bg-blue-500",
      title: "Information",
    },
    error: {
      icon: RiErrorWarningLine,
      border: "border-red-200 dark:border-red-800",
      bg: "bg-white dark:bg-slate-900",
      iconBg: "bg-red-50 text-red-600 dark:bg-red-900/30",
      bar: "bg-red-500",
      title: "Error",
    },
  };

  const current = styles[toast.type] || styles.info;
  const Icon = current.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${current.border} ${current.bg} p-4 shadow-2xl`}
    >
      <div className="flex gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.iconBg}`}
        >
          <Icon size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            {toast.title || current.title}
          </h4>

          {toast.message && (
            <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
              {toast.message}
            </p>
          )}
        </div>

        <button
          onClick={() => onClose(toast.id)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <RiCloseLine size={18} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full ${current.bar}`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);