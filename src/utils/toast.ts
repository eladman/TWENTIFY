export type ToastType = 'default' | 'success' | 'error';

export interface ToastEvent {
  message: string;
  type: ToastType;
  duration: number;
}

type Listener = (event: ToastEvent) => void;

const listeners = new Set<Listener>();

export const toastEmitter = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit(event: ToastEvent) {
    listeners.forEach((l) => l(event));
  },
};

function show(message: string, duration = 2000) {
  toastEmitter.emit({ message, type: 'default', duration });
}

function success(message: string, duration = 2000) {
  toastEmitter.emit({ message, type: 'success', duration });
}

function error(message: string, duration = 2000) {
  toastEmitter.emit({ message, type: 'error', duration });
}

export const toast = { show, success, error };
