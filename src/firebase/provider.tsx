
'use client';

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';
import { signIn as genkitSignIn, signUp as genkitSignUp } from '@genkit-ai/next/auth';


interface FirebaseAuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(
  undefined
);

export const FirebaseClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    return await genkitSignIn(email, password);
  };

  const signUp = async (email: string, password: string): Promise<UserCredential> => {
    return await genkitSignUp(email, password);
  };

  return (
    <FirebaseAuthContext.Provider value={{ user, isLoading, signOut, signIn, signUp }}>
      {!isLoading && children}
    </FirebaseAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseClientProvider');
  }
  return context;
};

    
