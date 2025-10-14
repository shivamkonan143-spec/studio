
'use client';

import Link from 'next/link';
import { Download, LogOut, User as UserIcon, Settings, Sun, Moon, Laptop, Languages, LogIn, Menu } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { setTheme } = useTheme();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

  return (
    <header className="flex w-full flex-col items-center gap-3 py-8 sm:py-12">
      <div className="flex w-full items-center justify-between">
        <div className="flex-1">
         {!isUserLoading && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {user ? (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Guest Menu</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/login" passHref>
                      <DropdownMenuItem>
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Log In</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/signup" passHref>
                      <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Sign Up</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme('light')}>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('dark')}>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('system')}>
                        <Laptop className="mr-2 h-4 w-4" />
                        <span>System</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Languages className="mr-2 h-4 w-4" />
                    <span>Language</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>
                        <span>English</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Hindi</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                {user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex flex-1 justify-center">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 p-2 shadow-lg">
            <Download className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
        </div>
      </div>
      <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Thumbnail Downloader
      </h1>
    </header>
  );
}
