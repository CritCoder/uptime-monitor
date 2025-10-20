import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import clsx from "clsx";
import { Button } from "@/components/ui/button-1";

const CloseIcon = ({
  className
}) => (
  <svg
    height="16"
    strokeLinejoin="round"
    viewBox="0 0 16 16"
    width="16"
    className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.4697 13.5303L13 14.0607L14.0607 13L13.5303 12.4697L9.06065 7.99999L13.5303 3.53032L14.0607 2.99999L13 1.93933L12.4697 2.46966L7.99999 6.93933L3.53032 2.46966L2.99999 1.93933L1.93933 2.99999L2.46966 3.53032L6.93933 7.99999L2.46966 12.4697L1.93933 13L2.99999 14.0607L3.53032 13.5303L7.99999 9.06065L12.4697 13.5303Z" />
  </svg>
);

const UndoIcon = () => (
  <svg
    height="16"
    strokeLinejoin="round"
    viewBox="0 0 16 16"
    width="16"
    className="fill-gray-1000">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.5 8C13.5 4.96643 11.0257 2.5 7.96452 2.5C5.42843 2.5 3.29365 4.19393 2.63724 6.5H5.25H6V8H5.25H0.75C0.335787 8 0 7.66421 0 7.25V2.75V2H1.5V2.75V5.23347C2.57851 2.74164 5.06835 1 7.96452 1C11.8461 1 15 4.13001 15 8C15 11.87 11.8461 15 7.96452 15C5.62368 15 3.54872 13.8617 2.27046 12.1122L1.828 11.5066L3.03915 10.6217L3.48161 11.2273C4.48831 12.6051 6.12055 13.5 7.96452 13.5C11.0257 13.5 13.5 11.0336 13.5 8Z" />
  </svg>
);

let root = null;
let toastId = 0;

const toastStore = {
  toasts: [],
  listeners: new Set(),

  add(
    text,
    type,
    preserve,
    action,
    onAction,
    onUndoAction
  ) {
    const id = toastId++;

    const toast = {
      id,
      text,
      preserve,
      action,
      onAction,
      onUndoAction,
      type
    };

    if (!toast.preserve) {
      toast.remaining = 3000;
      toast.start = Date.now();

      const close = () => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
        this.notify();
      };

      toast.timeout = setTimeout(close, toast.remaining);

      toast.pause = () => {
        if (!toast.timeout) return;
        clearTimeout(toast.timeout);
        toast.timeout = undefined;
        toast.remaining -= Date.now() - toast.start;
      };

      toast.resume = () => {
        if (toast.timeout) return;
        toast.start = Date.now();
        toast.timeout = setTimeout(close, toast.remaining);
      };
    }

    this.toasts.push(toast);
    this.notify();
  },

  remove(id) {
    toastStore.toasts = toastStore.toasts.filter((t) => t.id !== id);
    toastStore.notify();
  },

  subscribe(listener) {
    toastStore.listeners.add(listener);
    return () => {
      toastStore.listeners.delete(listener);
    };
  },

  notify() {
    toastStore.listeners.forEach((fn) => fn());
  }
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const [shownIds, setShownIds] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  const measureRef = (toast) => (node) => {
    if (node && toast.measuredHeight == null) {
      toast.measuredHeight = node.getBoundingClientRect().height;
      toastStore.notify();
    }
  };

  useEffect(() => {
    setToasts([...toastStore.toasts]);

    return toastStore.subscribe(() => {
      setToasts([...toastStore.toasts]);
    });
  }, []);

  useEffect(() => {
    const unseen = toasts.filter(t => !shownIds.includes(t.id)).map(t => t.id);
    if (unseen.length > 0) {
      requestAnimationFrame(() => {
        setShownIds(prev => [...prev, ...unseen]);
      });
    }
  }, [toasts]);

  const lastVisibleCount = 3;
  const lastVisibleStart = Math.max(0, toasts.length - lastVisibleCount);

  const getFinalTransform = (index, length) => {
    if (index === length - 1) {
      return "none";
    }
    const offset = length - 1 - index;
    let translateY = toasts[length - 1]?.measuredHeight || 63;
    for (let i = length - 1; i > index; i--) {
      if (isHovered) {
        translateY += (toasts[i - 1]?.measuredHeight || 63) + 10;
      } else {
        translateY += 20;
      }
    }
    const z = -offset;
    const scale = isHovered ? 1 : (1 - 0.05 * offset);
    return `translate3d(0, calc(100% - ${translateY}px), ${z}px) scale(${scale})`;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    toastStore.toasts.forEach((t) => t.pause?.());
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    toastStore.toasts.forEach((t) => t.resume?.());
  };

  const visibleToasts = toasts.slice(lastVisibleStart);
  const containerHeight = visibleToasts.reduce((acc, toast) => {
    return acc + (toast.measuredHeight ?? 63);
  }, 0);


  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] pointer-events-none w-[420px]"
      style={{ height: containerHeight }}>
      <div
        className="relative pointer-events-auto w-full"
        style={{ height: containerHeight }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        {toasts.map((toast, index) => {
          const isVisible = index >= lastVisibleStart;

          return (
            <div
              key={toast.id}
              ref={measureRef(toast)}
              className={clsx(
                "absolute right-0 bottom-0 shadow-menu rounded-xl leading-[21px] p-4 h-fit text-white",
                isVisible ? "opacity-100" : "opacity-0",
                index < lastVisibleStart && "pointer-events-none"
              )}
              style={{
                width: 420,
                transition: "all .35s cubic-bezier(.25,.75,.6,.98)",
                transform: shownIds.includes(toast.id)
                  ? getFinalTransform(index, toasts.length)
                  : "translate3d(0, 100%, 150px) scale(1)",
                background: {
                  message: "radial-gradient(ellipse at top left, rgba(55, 65, 81, 0.95) 0%, rgba(31, 41, 55, 1) 50%, rgba(17, 24, 39, 1) 100%)",
                  success: "radial-gradient(ellipse at top left, rgba(34, 197, 94, 0.85) 0%, rgba(22, 163, 74, 1) 50%, rgba(21, 128, 61, 1) 100%)",
                  warning: "radial-gradient(ellipse at top left, rgba(251, 191, 36, 0.85) 0%, rgba(245, 158, 11, 1) 50%, rgba(217, 119, 6, 1) 100%)",
                  error: "radial-gradient(ellipse at top left, rgba(239, 68, 68, 0.85) 0%, rgba(220, 38, 38, 1) 50%, rgba(185, 28, 28, 1) 100%)"
                }[toast.type]
              }}>
              <div className="flex flex-col items-center justify-between text-[.875rem]">
                <div className="w-full h-full flex items-center justify-between gap-4">
                  <span>{toast.text}</span>
                  {!toast.action && (
                    <div className="flex gap-1">
                      {toast.onUndoAction && (
                        <Button
                          type="tertiary"
                          svgOnly
                          size="small"
                          onClick={() => {
                            toast.onUndoAction?.();
                            toastStore.remove(toast.id);
                          }}>
                          <UndoIcon />
                        </Button>
                      )}
                      <Button
                        type="tertiary"
                        svgOnly
                        size="small"
                        onClick={() => toastStore.remove(toast.id)}>
                        <CloseIcon
                          className={{
                            message: "fill-gray-1000",
                            success: "fill-contrast-fg",
                            warning: "fill-gray-1000 dark:fill-gray-100",
                            error: "fill-contrast-fg"
                          }[toast.type]} />
                      </Button>
                    </div>
                  )}
                </div>
                {toast.action && (
                  <div className="w-full flex items-center justify-end gap-2">
                    <Button type="tertiary" size="small" onClick={() => toastStore.remove(toast.id)}>
                      Dismiss
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        if (toast?.onAction) {
                          toast?.onAction();
                        }
                        toastStore.remove(toast.id);
                      }}>
                      {toast.action}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const mountContainer = () => {
  if (root) return;
  const el = document.createElement("div");
  el.className = "fixed bottom-4 right-4 z-[9999]";
  document.body.appendChild(el);
  root = createRoot(el);
  root.render(<ToastContainer />);
};

export const useToasts = () => {
  return {
    message: useCallback(({
      text,
      preserve,
      action,
      onAction,
      onUndoAction
    }) => {
      mountContainer();
      toastStore.add(text, "message", preserve, action, onAction, onUndoAction);
    }, []),
    success: useCallback((text) => {
      mountContainer();
      toastStore.add(text, "success");
    }, []),
    warning: useCallback((text) => {
      mountContainer();
      toastStore.add(text, "warning");
    }, []),
    error: useCallback((text) => {
      mountContainer();
      toastStore.add(text, "error");
    }, [])
  };
};

