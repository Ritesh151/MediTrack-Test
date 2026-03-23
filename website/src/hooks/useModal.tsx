import { useState, useCallback, ReactNode } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

interface UseConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

interface UseConfirmDialogReturn {
  isOpen: boolean;
  message: string;
  title: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  showConfirm: (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }) => void;
  ConfirmDialog: React.ComponentType<UseConfirmDialogProps>;
}

export function useConfirmDialog() {
  const [state, setState] = useState({
    isOpen: false,
    title: 'Confirm',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
  });

  const showConfirm = useCallback((options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }) => {
    setState({
      isOpen: true,
      title: options.title || 'Confirm',
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm,
    });
  }, []);

  const onConfirm = useCallback(() => {
    state.onConfirm();
    setState(prev => ({ ...prev, isOpen: false }));
  }, [state.onConfirm]);

  const onCancel = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmDialog: React.ComponentType<UseConfirmDialogProps> = (props) => {
    if (!state.isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
          <h3 className="text-lg font-bold text-text-primary mb-2">{state.title}</h3>
          <p className="text-text-secondary mb-6">{state.message}</p>
          <div className="flex gap-3">
            <button
              onClick={props.onCancel}
              className="flex-1 px-4 py-2 border border-card-border rounded-lg text-text-secondary font-medium hover:bg-gray-50 transition-colors"
            >
              {state.cancelText}
            </button>
            <button
              onClick={props.onConfirm}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {state.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return {
    ...state,
    onConfirm,
    onCancel,
    showConfirm,
    ConfirmDialog,
  };
}
