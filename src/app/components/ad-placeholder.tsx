
import { Megaphone } from 'lucide-react';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { Button } from '@/components/ui/button';

export function AdPlaceholder({ showAd }: { showAd?: boolean }) {
  const { locale } = useLanguage();
  const t = translations[locale];

  if (!showAd) {
    return null;
  }

  return (
    <div className="mt-4 p-4 rounded-lg bg-muted/50 border flex flex-col items-center justify-center text-center">
        <Megaphone className="w-6 h-6 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground">{t.ad.placeholder}</p>
    </div>
  );
}
