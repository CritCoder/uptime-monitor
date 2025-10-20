import { useToasts } from '@/components/ui/toast';

// Create a singleton toast instance
let toastInstance = null;

const getToastInstance = () => {
  if (!toastInstance) {
    // Initialize the toast hooks
    const hooks = {
      message: null,
      success: null,
      warning: null,
      error: null
    };

    // This will be called to initialize the hooks
    const initHooks = (toasts) => {
      hooks.message = toasts.message;
      hooks.success = toasts.success;
      hooks.warning = toasts.warning;
      hooks.error = toasts.error;
    };

    toastInstance = {
      _initHooks: initHooks,
      _hooks: hooks
    };
  }
  return toastInstance;
};

// Sonner-compatible API
export const toast = (message, options = {}) => {
  const instance = getToastInstance();
  if (instance._hooks.message) {
    instance._hooks.message({ text: message, ...options });
  }
};

toast.success = (message) => {
  const instance = getToastInstance();
  if (instance._hooks.success) {
    instance._hooks.success(message);
  }
};

toast.error = (message) => {
  const instance = getToastInstance();
  if (instance._hooks.error) {
    instance._hooks.error(message);
  }
};

toast.warning = (message) => {
  const instance = getToastInstance();
  if (instance._hooks.warning) {
    instance._hooks.warning(message);
  }
};

toast.message = (message, options) => {
  const instance = getToastInstance();
  if (instance._hooks.message) {
    instance._hooks.message({ text: message, ...options });
  }
};

// Hook to initialize toast in the app
export const useInitToast = () => {
  const toasts = useToasts();
  const instance = getToastInstance();
  instance._initHooks(toasts);
};

export { useToasts };
