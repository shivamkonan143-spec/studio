import { Play } from 'lucide-react';

export function Header() {
  return (
    <header className="flex w-full flex-col max-w-2xl items-center gap-3 py-8 sm:py-12">
      <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 p-2 shadow-lg">
        <Play className="h-5 w-5 text-white fill-white" />
      </div>
      <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        YouTube Thumbnail Downloader
      </h1>
    </header>
  );
}
