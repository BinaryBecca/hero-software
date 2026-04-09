import { useEffect } from 'react';

const toneClasses = {
  warning: 'border-hero-accent/50 bg-[#3a3210] text-hero-accent',
  success: 'border-hero-success/40 bg-[#102717] text-[#b6f3c5]',
};

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:bottom-6">
      <div
        className={`animate-toastUp rounded-2xl border px-5 py-4 text-sm font-semibold shadow-glow ${toneClasses[toast.type]}`}
        role="status"
        aria-live="polite"
      >
        {toast.message}
      </div>
    </div>
  );
}

export default Toast;
