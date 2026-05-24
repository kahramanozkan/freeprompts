"use client";

import { ReactNode, useEffect } from "react";

export type ModalType = "error" | "warning" | "info" | "confirm";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | ReactNode;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCloseButton?: boolean;
}

const typeConfig = {
  error: {
    icon: (
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-red-100/50">
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    buttonColor: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    icon: (
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-yellow-100/50">
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5" />
        </svg>
      </div>
    ),
    buttonColor: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  info: {
    icon: (
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100/50">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    buttonColor: "bg-black hover:bg-gray-800 text-white",
  },
  confirm: {
    icon: (
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/50">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    buttonColor: "bg-red-600 hover:bg-red-700 text-white", // Default confirm action (often destructive like delete)
  },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop (Dark & Transparent) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config.icon}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{message}</div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          {type === "confirm" && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose();
            }}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${config.buttonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}