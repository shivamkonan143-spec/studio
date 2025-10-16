
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/app/components/header';
import { YoutubeDownloaderInput, YoutubeDownloaderPreview } from '@/app/components/video-downloader';
import { SubscriptionCard } from '@/app/components/subscription-card';
import { SocialLinks } from '@/app/components/social-links';

function HomeComponent() {
  const searchParams = useSearchParams();
  const [preview, setPreview] = useState<{ id: string; isShort: boolean } | null>(null);

  useEffect(() => {
    const videoId = searchParams.get('videoId');
    const isShort = searchParams.get('isShort') === 'true';
    if (videoId) {
      setPreview({ id: videoId, isShort });
    }
  }, [searchParams]);

  const handleGetThumbnail = (id: string, isShort: boolean) => {
    setPreview({ id, isShort });
  };

  const handleTryAnother = () => {
    setPreview(null);
    // Clear URL params
    window.history.replaceState({}, '', '/');
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(223,200,242,0.3),rgba(255,255,255,0))]">
      <Header />
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-6">
          <YoutubeDownloaderInput onGetThumbnail={handleGetThumbnail} />
          {preview && (
            <YoutubeDownloaderPreview
              videoId={preview.id}
              isShort={preview.isShort}
              onTryAnother={handleTryAnother}
            />
          )}
        </div>

        {!preview && <SubscriptionCard />}
        <SocialLinks />
      </div>
    </main>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeComponent />
    </Suspense>
  )
}
