'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthModalView = 'login' | 'signup' | 'forgot_password';

interface AuthModalContextType {
  isOpen: boolean;
  view: AuthModalView;
  openModal: (view?: AuthModalView) => void;
  closeModal: () => void;
  setView: (view: AuthModalView) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthModalView>('login');

  const openModal = (initialView: AuthModalView = 'login') => {
    setView(initialView);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, view, openModal, closeModal, setView }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
