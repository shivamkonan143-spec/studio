import { Image } from 'lucide-react';

export function Header() {
  return (
    <header className="flex w-full max-w-2xl items-center gap-3 py-8 sm:py-12">
      <div className="rounded-lg bg-primary/10 p-3">
        <Image className="h-6 w-6 text-primary" />
      </div>
      <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        YouTube Thumbnail Downloader
      </h1>
    </header>
  );
}
