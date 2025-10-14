
'use client';

import Link from 'next/link';
import { LogOut, User as UserIcon, Settings, Sun, Moon, Laptop, Languages, LogIn, Menu, LifeBuoy, UserPlus, Unplug, Download, Share2, X } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';

function MenuContent({ closeMenu }: { closeMenu?: () => void }) {
  const { user } = useUser();
  const auth = useAuth();
  const { setTheme } = useTheme();
  const { locale, changeLocale } = useLanguage();
  const t = translations[locale];
  const { toast } = useToast();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    closeMenu?.();
  };

  const mailtoHref = `mailto:shivamkonan143@gmail.com?subject=Support%20Request%20for%20Thumbnail%20Downloader${user?.email ? `&body=From%20user:%20${user.email}` : ''}`;
  
  const handleShare = async () => {
    const shareData = {
      title: t.title,
      text: t.share.text,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
            variant: 'destructive',
            title: t.share.shareFailedTitle,
            description: t.share.shareFailedDescription,
        });
      }
    } else {
      toast({
        title: t.share.notSupportedTitle,
        description: t.share.notSupportedDescription,
      });
    }
    closeMenu?.();
  };

  const handleLanguageChange = (newLocale: 'en' | 'hi') => {
    changeLocale(newLocale);
    closeMenu?.();
  };

  return (
      <DropdownMenu>
        {/* We need a trigger, but we'll control the open state from the parent Dialog/Sheet.
            This trigger can be a dummy element that is not displayed. */}
        <DropdownMenuTrigger asChild>
          <button className="hidden" />
        </DropdownMenuTrigger>
        {/* The DropdownMenuContent is what we want to render inside the Dialog/Sheet */}
        <DropdownMenuContent className="w-full border-none shadow-none p-2">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>{t.header.theme}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => { setTheme('light'); closeMenu?.(); }}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>{t.header.light}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTheme('dark'); closeMenu?.(); }}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>{t.header.dark}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTheme('system'); closeMenu?.(); }}>
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>{t.header.system}</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <span>{t.header.language}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                    <span>{t.header.english}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('hi')}>
                    <span>{t.header.hindi}</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              <span>{t.header.shareApp}</span>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <a href={mailtoHref} onClick={() => closeMenu?.()}>
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>{t.header.helpAndSupport}</span>
              </a>
            </DropdownMenuItem>

            <Separator className="my-1" />

            {user ? (
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.header.logout}</span>
                </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/login" onClick={() => closeMenu?.()}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>{t.header.login}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/signup" onClick={() => closeMenu?.()}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>{t.header.register}</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
  );
}


export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { locale } = useLanguage();
  const t = translations[locale];
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    const parts = email.split('@')[0];
    if (!parts) return 'U';
    return (parts[0] || '').toUpperCase() + (parts.length > 1 ? (parts[1] || '').toUpperCase() : '');
  };

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

  const MenuContainer = isMobile ? Sheet : Dialog;
  const MenuTrigger = isMobile ? SheetTrigger : DialogTrigger;
  const MenuContentContainer = isMobile ? SheetContent : DialogContent;
  const MenuHeader = isMobile ? SheetHeader : DialogHeader;
  const MenuTitle = isMobile ? SheetTitle : DialogTitle;

  return (
    <header className="flex w-full flex-col items-center gap-3 py-8 sm:py-12">
      <div className="w-full flex items-center justify-between">
        <div className="flex-1">
         {!isUserLoading && (
           <MenuContainer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <MenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </MenuTrigger>
            <MenuContentContainer
              side="left"
              className={isMobile ? "w-3/4 p-0" : "max-w-xs rounded-lg p-0"}
            >
              <MenuHeader className="p-4 pb-2">
                  <MenuTitle>{t.header.menu}</MenuTitle>
                  {!isMobile && <Separator className="mt-2" />}
              </MenuHeader>
              <MenuContent closeMenu={() => setIsMenuOpen(false)} />
            </MenuContentContainer>
          </MenuContainer>
          )}
        </div>
        <div className="flex flex-1 justify-center">
          <div className="relative rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 shadow-lg">
             <Download className="h-6 w-6 text-white"/>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
           {isUserLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
           ) : user ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || ''} />
                            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t.header.logout}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
           ) : (
             null
           )}
        </div>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-headline">
        {t.title}
      </h1>
    </header>
  );
}
