import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  success: () => {}, error: () => {}, warning: () => {}, info: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = 0;

  const add = useCallback((type: ToastType, title: string, message?: string) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const configs: Record<ToastType, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
    success: { icon: <CheckCircle size={18}/>, bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-700', text: 'text-green-800 dark:text-green-200' },
    error:   { icon: <XCircle size={18}/>,    bg: 'bg-red-50 dark:bg-red-900/30',    border: 'border-red-200 dark:border-red-700',   text: 'text-red-800 dark:text-red-200' },
    warning: { icon: <AlertCircle size={18}/>, bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-700', text: 'text-yellow-800 dark:text-yellow-200' },
    info:    { icon: <Info size={18}/>,        bg: 'bg-blue-50 dark:bg-blue-900/30',  border: 'border-blue-200 dark:border-blue-700',  text: 'text-blue-800 dark:text-blue-200' },
  };

  return (
    <ToastContext.Provider value={{
      success: (t, m) => add('success', t, m),
      error:   (t, m) => add('error', t, m),
      warning: (t, m) => add('warning', t, m),
      info:    (t, m) => add('info', t, m),
    }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => {
          const cfg = configs[toast.type];
          return (
            <div key={toast.id}
              className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg max-w-sm pointer-events-auto animate-slide-up ${cfg.bg} ${cfg.border}`}>
              <span className={cfg.text}>{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${cfg.text}`}>{toast.title}</p>
                {toast.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{toast.message}</p>}
              </div>
              <button onClick={() => remove(toast.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X size={14}/>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
