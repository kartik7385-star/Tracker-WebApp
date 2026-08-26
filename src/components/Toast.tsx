import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface ToastState {
  id: number;
  type: ToastType;
  message: string;
}

let pushFn: ((type: ToastType, message: string) => void) | null = null;

export function toast(type: ToastType, message: string) {
  pushFn?.(type, message);
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    pushFn = (type, message) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
    };
    return () => {
      pushFn = null;
    };
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex animate-fade-in items-start gap-3 rounded-xl bg-white p-3.5 shadow-card ring-1 ring-ink-100"
        >
          {t.type === 'success' && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-500" />}
          {t.type === 'error' && <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error-500" />}
          {t.type === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />}
          <p className="flex-1 text-sm font-medium text-ink-700">{t.message}</p>
          <button onClick={() => dismiss(t.id)} className="text-ink-400 hover:text-ink-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
