
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/app/components/header';
import { YoutubeDownloaderPreview } from '@/app/components/video-downloader';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function PreviewPageContents() {
    const searchParams = useSearchParams();
    const videoId = searchParams.get('id');
    const isShort = searchParams.get('isShort') === 'true';

    if (!videoId) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    No video ID provided. Please go back and try again.
                </AlertDescription>
            </Alert>
        )
    }

    return <YoutubeDownloaderPreview videoId={videoId} isShort={isShort} />;
}


export default function PreviewPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(223,200,242,0.3),rgba(255,255,255,0))]">
      <Header />
      <div className="w-full max-w-2xl space-y-6">
        <Suspense fallback={
            <Card>
                <CardContent className="pt-6">
                    <div className="flex min-h-[200px] w-full items-center justify-center rounded-md border border-dashed">
                        <p>Loading preview...</p>
                    </div>
                </CardContent>
            </Card>
        }>
            <PreviewPageContents />
        </Suspense>
      </div>
    </main>
  );
}
