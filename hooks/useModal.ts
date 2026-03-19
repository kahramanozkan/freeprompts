"use client";

import { useState, useCallback } from "react";
import { ModalType } from "@/components/ui/Modal";

export interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCloseButton?: boolean;
}

export interface ModalState extends ModalOptions {
  isOpen: boolean;
}

export default function useModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
    cancelText: "Cancel",
    showCloseButton: true,
  });

  const openModal = useCallback((options: ModalOptions) => {
    setModalState({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || "info",
      confirmText: options.confirmText || "OK",
      cancelText: options.cancelText || "Cancel",
      onConfirm: options.onConfirm,
      showCloseButton: options.showCloseButton ?? true,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const confirmModal = useCallback(() => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    closeModal();
  }, [modalState, closeModal]);

  return {
    modalState,
    openModal,
    closeModal,
    confirmModal,
  };
}