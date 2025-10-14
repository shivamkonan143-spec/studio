import { Header } from '@/app/components/header';
import { DownloaderTabs } from '@/app/components/video-downloader';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12">
      <Header />
      <div className="w-full max-w-2xl">
        <DownloaderTabs />
      </div>
    </main>
  );
}
