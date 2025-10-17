
'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/app/components/header';
import { YoutubeDownloaderInput, YoutubeDownloaderPreview } from '@/app/components/video-downloader';
import { SubscriptionCard } from '@/app/components/subscription-card';
import { SocialLinks } from '@/app/components/social-links';
import { useLayout } from '@/app/context/layout-context';

function HomeComponent() {
  const searchParams = useSearchParams();
  const { setPreview, preview } = useLayout();

  const videoId = searchParams.get('videoId');
  const isShort = searchParams.get('isShort') === 'true';

  // Effect to sync URL params to state on initial load
  useEffect(() => {
    if (videoId && (!preview || preview.id !== videoId)) {
      setPreview({ id: videoId, isShort });
    }
  }, [videoId, isShort, preview, setPreview]);

  const handleGetThumbnail = (id: string, isShort: boolean) => {
    setPreview({ id, isShort });
  };

  const handleTryAnother = () => {
    setPreview(null);
    // Clear URL params
    window.history.replaceState({}, '', '/');
  };

  return (
    <main 
      className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12"
    >
      <Header />
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-8">
          {!preview && (
            <div>
              <YoutubeDownloaderInput onGetThumbnail={handleGetThumbnail} />
            </div>
          )}
          {preview && (
            <div>
              <YoutubeDownloaderPreview
                videoId={preview.id}
                isShort={preview.isShort}
                onTryAnother={handleTryAnother}
              />
            </div>
          )}
        </div>

        {!preview && (
          <div>
            <SubscriptionCard />
          </div>
        )}
         <div>
          <SocialLinks />
        </div>
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
