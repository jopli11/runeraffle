import toast from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  id?: string;
}

// Function to display a success toast
export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...options,
    id: options?.id,
  });
};

// Function to display an error toast
export const showError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    ...options,
    id: options?.id,
  });
};

// Function to display an info toast
export const showInfo = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...options,
    id: options?.id,
  });
};

// Function to display a loading toast which can be updated later
export const showLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    ...options,
    id: options?.id,
  });
};

// Function to update a toast
export const updateToast = (id: string, message: string, type: 'success' | 'error' | 'loading' | 'default'): void => {
  if (type === 'success') {
    toast.success(message, { id });
  } else if (type === 'error') {
    toast.error(message, { id });
  } else if (type === 'loading') {
    toast.loading(message, { id });
  } else {
    toast(message, { id });
  }
};

// Function to dismiss a toast
export const dismissToast = (id?: string): void => {
  if (id) {
    toast.dismiss(id);
  } else {
    toast.dismiss();
  }
};

// Function to display a promise toast that shows different states during an async operation
export const showPromise = <T>(
  promise: Promise<T>,
  {
    loading = 'Loading...',
    success = 'Success!',
    error = 'Error occurred',
  }: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((err: any) => string);
  },
  options?: ToastOptions
): Promise<T> => {
  return toast.promise(
    promise,
    {
      loading,
      success: (data) => (typeof success === 'function' ? success(data) : success),
      error: (err) => (typeof error === 'function' ? error(err) : error),
    },
    options
  );
};

export default {
  success: showSuccess,
  error: showError,
  info: showInfo,
  loading: showLoading,
  update: updateToast,
  dismiss: dismissToast,
  promise: showPromise,
}; 