import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastsProps {
  toasts: ToastMessage[];
}

const Toasts: React.FC<ToastsProps> = memo(({ toasts }) => {
  return (
    <div className="toast-container" aria-live="assertive">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div 
            key={toast.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`toast ${toast.type}`}
            role="alert"
          >
            <div className="toast-icon" aria-hidden="true">
              {toast.type === 'warning' ? (
                <AlertTriangle size={20} color="var(--warning)" />
              ) : (
                <Check size={20} color="var(--primary-color)" />
              )}
            </div>
            <div>
              <div className="toast-title">{toast.title}</div>
              <div className="toast-desc">{toast.desc}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

Toasts.displayName = 'Toasts';
export default Toasts;
