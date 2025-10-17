'use client';

import { useRef, type ReactNode } from 'react';
import { useLayout } from '@/app/context/layout-context';

const SWIPE_THRESHOLD = 50; // Minimum pixels for a swipe

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const { isMenuOpen, setIsMenuOpen } = useLayout();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX; // Reset on new touch
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = swipeDistance > SWIPE_THRESHOLD;
    const isRightSwipe = swipeDistance < -SWIPE_THRESHOLD;

    if (isRightSwipe && !isMenuOpen) {
      setIsMenuOpen(true);
    }

    if (isLeftSwipe && isMenuOpen) {
      setIsMenuOpen(false);
    }

    // Reset touch positions
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}
