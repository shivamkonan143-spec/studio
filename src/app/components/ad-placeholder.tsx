
import { Megaphone } from 'lucide-react';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { Button } from '@/components/ui/button';

export function AdPlaceholder() {
  const { locale } = useLanguage();
  const t = translations[locale];

  return (
    <div className="w-full my-6 text-center">
      <Button variant="link" className="w-full mt-2">
        {t.videoDownloader.subscribeNow}
      </Button>
    </div>
  );
}
