
'use client';

import Link from 'next/link';
import { Settings, Sun, Moon, Laptop, Languages, Menu, LifeBuoy, Info, ChevronDown, MessageCircle, Home, User as UserIcon, LogOut, History, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from 'next-themes';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuth, useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';


function MenuContent({ closeMenu }: { closeMenu?: () => void }) {
  const { setTheme } = useTheme();
  const { locale, changeLocale } = useLanguage();
  const t = translations[locale];
  const { user } = useUser();
  
  const mailtoHref = `mailto:shivamkonan143@gmail.com?subject=Support%20Request%20for%20Thumbnail%20Downloader`;
  const whatsappHref = `https://wa.me/917488530499?text=support%20thambnail%20downloader`;
  
  const handleLanguageChange = (newLocale: 'en' | 'hi') => {
    changeLocale(newLocale);
    closeMenu?.();
  };

  const whatsAppShareUrl = `https://wa.me/?text=${encodeURIComponent(`${t.share.text} https://6000-firebase-studio-1760436580721.cluster-osvg2nzmmzhzqqjio6oojllbg4.cloudworkstations.dev/`)}`;

  return (
      <div className="flex flex-col gap-1 p-2">
        <Button variant="ghost" asChild className="w-full justify-start hover:bg-transparent focus:bg-transparent">
          <Link href="/" onClick={() => closeMenu?.()}>
            <Home className="mr-2 h-4 w-4" />
            <span>{t.header.home}</span>
          </Link>
        </Button>
        {user && (
          <Button variant="ghost" asChild className="w-full justify-start hover:bg-transparent focus:bg-transparent">
            <Link href="/history" onClick={() => closeMenu?.()}>
              <History className="mr-2 h-4 w-4" />
              <span>{t.header.history}</span>
            </Link>
          </Button>
        )}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start hover:bg-transparent focus:bg-transparent">
              <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span>{t.header.theme}</span>
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pl-6">
            <Button variant="ghost" className="w-full justify-start hover:bg-transparent focus:bg-transparent" onClick={() => { setTheme('light'); closeMenu?.(); }}>
              <Sun className="mr-2 h-4 w-4" />
              <span>{t.header.light}</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-transparent focus:bg-transparent" onClick={() => { setTheme('dark'); closeMenu?.(); }}>
              <Moon className="mr-2 h-4 w-4" />
              <span>{t.header.dark}</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-transparent focus:bg-transparent" onClick={() => { setTheme('system'); closeMenu?.(); }}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>{t.header.system}</span>
            </Button>
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start hover:bg-transparent focus:bg-transparent">
              <Languages className="mr-2 h-4 w-4" />
              <span>{t.header.language}</span>
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pl-6">
            <Button variant="ghost" className="w-full justify-start hover:bg-transparent focus:bg-transparent" onClick={() => handleLanguageChange('en')}>
              <span>{t.header.english}</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-transparent focus:bg-transparent" onClick={() => handleLanguageChange('hi')}>
              <span>{t.header.hindi}</span>
            </Button>
          </CollapsibleContent>
        </Collapsible>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-start">
            <span className="bg-popover pr-2 text-sm font-medium text-muted-foreground">{t.header.support}</span>
          </div>
        </div>
        
        <Button variant="ghost" asChild className="w-full justify-start hover:bg-transparent focus:bg-transparent">
            <a href={whatsAppShareUrl} target="_blank" rel="noopener noreferrer" onClick={() => closeMenu?.()}>
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>{t.header.shareApp}</span>
            </a>
        </Button>

        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start hover:bg-transparent focus:bg-transparent">
                    <Info className="mr-2 h-4 w-4" />
                    <span>{t.header.aboutUs}</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.header.aboutUs}</DialogTitle>
                    <DialogDescription>
                        {t.about.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t.about.totalUsers}</span>
                        <span className="font-bold">10,000+</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t.about.averageRating}</span>
                        <span className="font-bold">4.8 / 5</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        <Button variant="ghost" asChild className="w-full justify-start hover:bg-transparent focus:bg-transparent">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => closeMenu?.()}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>{t.header.whatsappSupport}</span>
          </a>
        </Button>

        <Button variant="ghost" asChild className="w-full justify-start hover:bg-transparent focus:bg-transparent">
          <a href={mailtoHref} onClick={() => closeMenu?.()}>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>{t.header.helpAndSupport}</span>
          </a>
        </Button>
      </div>
  );
}

function AccountButton() {
  const { user } = useUser();
  const auth = useAuth();
  const { locale } = useLanguage();
  const t = translations[locale];
  const router = useRouter();

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email || 'User'} />
              <AvatarFallback>{user.email ? user.email.charAt(0).toUpperCase() : <UserIcon />}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.email || t.common.user}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t.header.logout}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button onClick={() => router.push('/login')} variant="default">
      {t.header.login}
    </Button>
  )
}


export function Header() {
  const { locale } = useLanguage();
  const t = translations[locale];
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const MenuContainer = isMobile ? Sheet : Dialog;
  const MenuTrigger = isMobile ? SheetTrigger : DialogTrigger;
  const MenuContentContainer = isMobile ? SheetContent : DialogContent;
  const MenuHeader = isMobile ? SheetHeader : DialogHeader;
  const MenuTitle = isMobile ? SheetTitle : DialogTitle;

  return (
    <header className="flex w-full flex-col items-center gap-2 py-2">
      <div className="w-full flex items-center justify-between">
        <div className="flex-1 flex justify-start">
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
        </div>
        <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent font-headline">
                Welcome
            </h1>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
            <AccountButton />
        </div>
      </div>
    </header>
  );
}
    

    

    
