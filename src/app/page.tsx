
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/app/components/header';
import { YoutubeDownloaderInput, YoutubeDownloaderPreview } from '@/app/components/video-downloader';
import { SubscriptionCard } from '@/app/components/subscription-card';
import { SocialLinks } from '@/app/components/social-links';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageToQr } from '@/app/components/image-to-qr';
import { QrCode, Youtube } from 'lucide-react';

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
        <Tabs defaultValue="thumbnail" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="thumbnail">
              <Youtube className="mr-2 h-4 w-4" />
              Thumbnail Downloader
            </TabsTrigger>
            <TabsTrigger value="image-qr">
               <QrCode className="mr-2 h-4 w-4" />
              Image to QR
            </TabsTrigger>
          </TabsList>
          <TabsContent value="thumbnail" className="mt-6">
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
          </TabsContent>
          <TabsContent value="image-qr" className="mt-6">
            <ImageToQr />
          </TabsContent>
        </Tabs>

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
