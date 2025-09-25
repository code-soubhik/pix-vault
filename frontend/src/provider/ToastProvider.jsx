import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(undefined);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = nextId++;
    const duration = toast.duration ?? 3000;
    const item = { id, type: toast.type || 'info', message: toast.message, duration };
    setToasts((prev) => [...prev, item]);
    if (duration > 0) {
      window.setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const value = useMemo(() => ({ push, remove }), [push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={containerStyle}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...toastStyle, ...typeStyle[t.type] }} onClick={() => remove(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

const containerStyle = {
  position: 'fixed',
  top: 16,
  right: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  zIndex: 1000,
};

const toastStyle = {
  minWidth: 240,
  maxWidth: 360,
  padding: '12px 14px',
  borderRadius: 8,
  color: '#0b0f17',
  background: 'white',
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1.4,
};

const typeStyle = {
  info: {},
  success: { borderLeft: '4px solid #22c55e' },
  error: { borderLeft: '4px solid #ef4444' },
  warning: { borderLeft: '4px solid #f59e0b' },
};

export default ToastProvider;


