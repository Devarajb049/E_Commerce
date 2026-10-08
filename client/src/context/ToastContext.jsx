import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, isExiting: false }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container (Rule #24) */}
      <div 
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-3 rounded-[8px] border bg-white shadow-dropdown transition-all duration-200 transform ${
              toast.isExiting
                ? 'opacity-0 translate-y-2 scale-95'
                : 'opacity-100 translate-y-0 scale-100'
            } ${
              toast.type === 'success'
                ? 'border-green-200 text-gray-900'
                : toast.type === 'error'
                ? 'border-red-200 text-gray-900'
                : 'border-indigo-100 text-gray-900'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-brand-success flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-brand-error flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-brand-indigo flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
