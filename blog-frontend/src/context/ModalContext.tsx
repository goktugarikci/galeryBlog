// src/context/ModalContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

// Modal'ın 'login' formunu mu, 'register' formunu mu göstereceğini belirten tip
type ModalView = 'login' | 'register' | null;

interface ModalContextType {
  view: ModalView;
  openModal: (view: 'login' | 'register') => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [view, setView] = useState<ModalView>(null);

  const openModal = (view: 'login' | 'register') => setView(view);
  const closeModal = () => setView(null);

  return (
    <ModalContext.Provider value={{ view, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal, ModalProvider içinde kullanılmalıdır');
  }
  return context;
};