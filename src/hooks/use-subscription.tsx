
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const SUBSCRIPTION_KEY = 'premium_subscription_status';

interface SubscriptionContextType {
  isSubscribed: boolean;
  activateSubscription: () => void;
  cancelSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const subscriptionStatus = localStorage.getItem(SUBSCRIPTION_KEY);
      if (subscriptionStatus) {
        const { expiry } = JSON.parse(subscriptionStatus);
        if (new Date().getTime() < expiry) {
          setIsSubscribed(true);
        } else {
          // Subscription has expired
          localStorage.removeItem(SUBSCRIPTION_KEY);
          setIsSubscribed(false);
        }
      }
    } catch (error) {
      console.error('Could not read subscription status from local storage', error);
    }
    setIsLoading(false);
  }, []);

  const activateSubscription = useCallback(() => {
    try {
      const expiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days from now
      localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ active: true, expiry }));
      setIsSubscribed(true);
    } catch (error) {
      console.error('Could not save subscription status to local storage', error);
    }
  }, []);

  const cancelSubscription = useCallback(() => {
    try {
      localStorage.removeItem(SUBSCRIPTION_KEY);
      setIsSubscribed(false);
    } catch (error) {
      console.error('Could not remove subscription status from local storage', error);
    }
  }, []);
  
  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, activateSubscription, cancelSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
