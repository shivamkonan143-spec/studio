'use client';

import Link from 'next/link';
import { Play, LogOut, User as UserIcon } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

  return (
    <header className="flex w-full flex-col items-center gap-3 py-8 sm:py-12">
      <div className="flex w-full items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex flex-1 justify-center">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 p-2 shadow-lg">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          {!isUserLoading && (
            <>
              {user ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Thumbnail Downloader
      </h1>
    </header>
  );
}
