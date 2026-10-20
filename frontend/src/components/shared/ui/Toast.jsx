"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

const STYLE = {
  success: { Icon: CheckCircle2, box: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: "text-emerald-600", ms: 3500 },
  error: { Icon: XCircle, box: "border-red-200 bg-red-50 text-red-800", icon: "text-red-600", ms: 7000 },
  warning: { Icon: AlertTriangle, box: "border-amber-200 bg-amber-50 text-amber-900", icon: "text-amber-600", ms: 5000 },
};

/**
 * Pemakaian:
 *   const { toasts, toast, dismiss } = useToast();
 *   toast.success("Tersimpan"); toast.error("Gagal"); toast.warning("Lengkapi data");
 *   ...
 *   <ToastContainer toasts={toasts} onDismiss={dismiss} />
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((t) => [...t.slice(-3), { id, type, message }]); // maksimal 4 toast
      timers.current.set(id, setTimeout(() => dismiss(id), STYLE[type].ms));
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  const toast = useRef({
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    warning: (m) => push("warning", m),
  }).current;

  return { toasts, toast, dismiss };
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed left-1/2 top-20 z-[10000] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-3"
      aria-live="polite"
    >
      {toasts.map(({ id, type, message }) => {
        const { Icon, box, icon } = STYLE[type];
        return (
          <div
            key={id}
            role={type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-5 py-4 shadow-xl text-sm md:text-base font-medium ${box}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${icon}`} />
            <p className="flex-1 break-words">{message}</p>
            <button
              type="button"
              onClick={() => onDismiss(id)}
              className="shrink-0 opacity-60 hover:opacity-100"
              aria-label="Tutup notifikasi"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}