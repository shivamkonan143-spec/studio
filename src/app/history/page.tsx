
'use client';

import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Header } from '@/app/components/header';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { Loader2, VideoOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VideoDownload {
  videoId: string;
  title: string;
  isShort: boolean;
  downloadedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

function HistoryItem({ item }: { item: VideoDownload }) {
  const thumbnailUrl = `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
  const videoUrl = `https://www.youtube.com/watch?v=${item.videoId}`;
  
  return (
    <Link href={videoUrl} target="_blank" rel="noopener noreferrer" className="group">
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative aspect-video">
          <Image
            src={thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>
        <CardContent className="p-3 flex-grow">
          <p className="text-sm font-medium line-clamp-2" title={item.title}>
            {item.title}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { locale } = useLanguage();
  const t = translations[locale];

  const historyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/videoDownloads`),
      orderBy('downloadedAt', 'desc')
    );
  }, [firestore, user]);

  const { data: history, isLoading } = useCollection<VideoDownload>(historyQuery);

  const renderContent = () => {
    if (isUserLoading || (user && isLoading)) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (!user) {
        return (
            <div className="text-center py-16 px-4">
                <VideoOff className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">{t.history.loginRequiredTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.history.loginRequiredDescription}</p>
                <Button asChild className="mt-6">
                    <Link href="/login?redirect=/history">{t.header.login}</Link>
                </Button>
            </div>
        )
    }

    if (history && history.length === 0) {
      return (
        <div className="text-center py-16 px-4">
          <VideoOff className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">{t.history.noHistoryTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t.history.noHistoryDescription}</p>
          <Button asChild className="mt-6">
            <Link href="/">{t.history.backToHome}</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history?.map((item) => (
          <HistoryItem key={item.id} item={item} />
        ))}
      </div>
    );
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12">
      <Header />
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{t.history.title}</h1>
        {renderContent()}
      </div>
    </main>
  );
}
