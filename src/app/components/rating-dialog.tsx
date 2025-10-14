'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const RATING_STORAGE_KEY = 'app-rating-given';

export function RatingDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { locale } = useLanguage();
  const t = translations[locale];
  const { toast } = useToast();

  const handleRatingSubmit = () => {
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: t.rating.selectRatingTitle,
        description: t.rating.selectRatingDescription,
      });
      return;
    }
    // Here you would typically send the rating to your backend
    console.log(`User submitted rating: ${rating}`);

    // Store in local storage that the user has rated
    try {
      localStorage.setItem(RATING_STORAGE_KEY, 'true');
    } catch (error) {
      console.error('Could not save rating status to local storage', error);
    }

    toast({
      variant: 'success',
      title: t.rating.thanksTitle,
      description: t.rating.thanksDescription,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.rating.title}</DialogTitle>
          <DialogDescription>{t.rating.description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'h-8 w-8 cursor-pointer transition-colors',
                  (hoverRating >= star || rating >= star)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                )}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleRatingSubmit}>{t.rating.submit}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function checkIfRatingGiven() {
    if (typeof window === 'undefined') return true;
    try {
        return localStorage.getItem(RATING_STORAGE_KEY) === 'true';
    } catch (error) {
        console.error('Could not read from local storage', error);
        return true; // Assume given if local storage is not available
    }
}
