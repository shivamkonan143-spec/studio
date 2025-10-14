
import { Megaphone } from 'lucide-react';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';

export function AdPlaceholder() {
  const { locale } = useLanguage();
  const t = translations[locale];

  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-center w-full h-24 bg-muted/40 border border-dashed rounded-lg">
        <div className="text-center text-muted-foreground">
          <Megaphone className="mx-auto h-6 w-6" />
          <p className="text-sm font-medium">{t.ad.placeholder}</p>
        </div>
      </div>
    </div>
  );
}
