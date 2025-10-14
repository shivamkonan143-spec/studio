
'use client';

import { Header } from '@/app/components/header';
import { YoutubeDownloaderInput } from '@/app/components/video-downloader';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(223,200,242,0.3),rgba(255,255,255,0))]">
      <Header />
      <div className="w-full max-w-2xl space-y-6">
        <YoutubeDownloaderInput />
      </div>
    </main>
  );
}
