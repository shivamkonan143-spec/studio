import { Header } from '@/app/components/header';
import { YoutubeTool } from '@/app/components/video-downloader';
import { AdPlaceholder } from '@/app/components/ad-placeholder';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12">
      <Header />
      <div className="w-full max-w-2xl">
        <YoutubeTool />
        <AdPlaceholder />
      </div>
    </main>
  );
}
