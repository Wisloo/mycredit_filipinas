"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

/* ── Types ── */
export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

/* ── Context ── */
const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

/* ── Styles ── */
const iconMap: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const containerStyle: Record<ToastType, string> = {
  success: "bg-white border-emerald-200 text-gray-800",
  error:   "bg-white border-red-200 text-gray-800",
  warning: "bg-white border-amber-200 text-gray-800",
  info:    "bg-white border-blue-200 text-gray-800",
};

const iconStyle: Record<ToastType, string> = {
  success: "text-emerald-500",
  error:   "text-red-500",
  warning: "text-amber-500",
  info:    "text-blue-500",
};

const progressStyle: Record<ToastType, string> = {
  success: "bg-emerald-400",
  error:   "bg-red-400",
  warning: "bg-amber-400",
  info:    "bg-blue-400",
};

const DURATION = 4000;

/* ── Single Toast Item ── */
function ToastCard({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const Icon = iconMap[item.type];
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 pt-4 pb-3 rounded-2xl border shadow-lg overflow-hidden animate-fade-in ${containerStyle[item.type]}`}
      style={{ maxWidth: 360 }}
    >
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${iconStyle[item.type]}`} />
      <p className="text-sm font-medium flex-1 leading-snug pr-6">{item.message}</p>
      <button
        onClick={() => onRemove(item.id)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 transition-all ease-linear"
        style={{ width: `${progress}%`, transitionDuration: "50ms" }}
      >
        <div className={`h-full ${progressStyle[item.type]}`} />
      </div>
    </div>
  );
}

/* ── Provider ── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DURATION + 300);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast stack — bottom-right on desktop, bottom-center on mobile */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard item={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
