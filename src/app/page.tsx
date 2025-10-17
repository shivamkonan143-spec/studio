
'use client';

import { useState, useEffect, Suspense, TouchEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/app/components/header';
import { YoutubeDownloaderInput, YoutubeDownloaderPreview } from '@/app/components/video-downloader';
import { SubscriptionCard } from '@/app/components/subscription-card';
import { SocialLinks } from '@/app/components/social-links';

const SWIPE_THRESHOLD = 50; // Minimum pixels for a swipe

function HomeComponent() {
  const searchParams = useSearchParams();
  const [preview, setPreview] = useState<{ id: string; isShort: boolean } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const videoId = searchParams.get('videoId');
  const isShort = searchParams.get('isShort') === 'true';

  useEffect(() => {
    if (videoId) {
      setPreview({ id: videoId, isShort });
    }
  }, [videoId, isShort]);

  const handleGetThumbnail = (id: string, isShort: boolean) => {
    setPreview({ id, isShort });
  };

  const handleTryAnother = () => {
    setPreview(null);
    // Clear URL params
    window.history.replaceState({}, '', '/');
  };

  const handleTouchStart = (e: TouchEvent) => {
    // Only track horizontal swipes from the right edge
    if (e.touches[0].clientX > window.innerWidth - 60) {
        setTouchStartX(e.touches[0].clientX);
    } else {
        setTouchStartX(null);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStartX === null) return;

    const touchCurrentX = e.touches[0].clientX;
    const diffX = touchStartX - touchCurrentX;

    // Check for a right-to-left swipe
    if (diffX > SWIPE_THRESHOLD) {
      setIsMenuOpen(true);
      setTouchStartX(null); // Reset after swipe
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };


  return (
    <main 
      className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12 animate-fade-in-up"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
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

    