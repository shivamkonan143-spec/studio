
'use client';

import { useState } from 'react';
import { collection, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Header } from '@/app/components/header';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { Loader2, VideoOff, CheckCircle, Circle, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface VideoDownload {
  id: string;
  videoId: string;
  title: string;
  isShort: boolean;
  downloadedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

function HistoryItem({ 
  item, 
  isSelectionActive, 
  isSelected, 
  onSelect 
}: { 
  item: VideoDownload,
  isSelectionActive: boolean,
  isSelected: boolean,
  onSelect: (id: string) => void,
}) {
  const thumbnailUrl = `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
  const videoUrl = `/?videoId=${item.videoId}&isShort=${item.isShort}`;

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectionActive) {
      e.preventDefault();
      onSelect(item.id);
    }
  };
  
  return (
    <div className="relative group" onClick={handleClick}>
      <Link href={isSelectionActive ? '#' : videoUrl} className={cn("group", isSelectionActive && "cursor-pointer")}>
        <Card className="overflow-hidden h-full flex flex-col">
          <div className="relative aspect-video">
            <Image
              src={thumbnailUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          </div>
          <CardContent className="p-3 flex-grow">
            <p className="text-sm font-medium line-clamp-2" title={item.title}>
              {item.title}
            </p>
          </CardContent>
        </Card>
      </Link>
      {isSelectionActive && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
          {isSelected ? (
            <CheckCircle className="h-8 w-8 text-white" />
          ) : (
            <Circle className="h-8 w-8 text-white/70" />
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { locale } = useLanguage();
  const t = translations[locale];
  const { toast } = useToast();

  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const historyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/videoDownloads`),
      orderBy('downloadedAt', 'desc')
    );
  }, [firestore, user]);

  const { data: history, isLoading } = useCollection<VideoDownload>(historyQuery);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (history) {
      if (selectedIds.length === history.length) {
        // If all are selected, deselect all
        setSelectedIds([]);
      } else {
        // Otherwise, select all
        setSelectedIds(history.map(item => item.id));
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (!user || !firestore || selectedIds.length === 0) return;

    const batch = writeBatch(firestore);
    selectedIds.forEach(id => {
      const docRef = doc(firestore, `users/${user.uid}/videoDownloads`, id);
      batch.delete(docRef);
    });

    try {
      await batch.commit();
      toast({
        variant: 'success',
        title: t.history.deleteSuccessTitle,
        description: t.history.deleteSuccessDescription.replace('{count}', selectedIds.length.toString()),
      });
      setSelectedIds([]);
      setIsSelectionActive(false);
    } catch (error) {
      console.error("Error deleting documents: ", error);
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.history.deleteErrorDescription,
      });
    }
  };

  const handleDeleteAll = async () => {
    if (!user || !firestore || !history || history.length === 0) return;
  
    const batch = writeBatch(firestore);
    history.forEach(item => {
      const docRef = doc(firestore, `users/${user.uid}/videoDownloads`, item.id);
      batch.delete(docRef);
    });
  
    try {
      await batch.commit();
      toast({
        variant: 'success',
        title: t.history.deleteAllSuccessTitle,
        description: t.history.deleteAllSuccessDescription,
      });
      setSelectedIds([]);
      setIsSelectionActive(false);
    } catch (error) {
      console.error("Error deleting all documents: ", error);
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.history.deleteErrorDescription,
      });
    }
  };


  const renderContent = () => {
    if (isUserLoading || (user && isLoading)) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (!user) {
        return (
            <div className="text-center py-16 px-4">
                <VideoOff className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">{t.history.loginRequiredTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.history.loginRequiredDescription}</p>
                <Button asChild className="mt-6">
                    <Link href="/login?redirect=/history">{t.header.login}</Link>
                </Button>
            </div>
        )
    }

    if (history && history.length === 0) {
      return (
        <div className="text-center py-16 px-4">
          <VideoOff className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">{t.history.noHistoryTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t.history.noHistoryDescription}</p>
          <Button asChild className="mt-6">
            <Link href="/">{t.history.backToHome}</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history?.map((item) => (
          <HistoryItem 
            key={item.id} 
            item={item}
            isSelectionActive={isSelectionActive}
            isSelected={selectedIds.includes(item.id)}
            onSelect={toggleSelection}
          />
        ))}
      </div>
    );
  };
  
  const hasHistory = history && history.length > 0;

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12">
      <Header />
      <div className="w-full max-w-6xl space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">{t.history.title}</h1>
            {hasHistory && (
                 <Button 
                    variant="outline" 
                    onClick={() => {
                        setIsSelectionActive(!isSelectionActive);
                        setSelectedIds([]); // Reset selection when toggling
                    }}
                >
                    {isSelectionActive ? <><X className="mr-2 h-4 w-4"/> {t.history.cancel}</> : t.history.select}
                </Button>
            )}
        </div>

        {isSelectionActive && hasHistory && (
             <div className="flex justify-end items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Button variant="ghost" onClick={handleSelectAll}>
                  {t.history.selectAll}
                </Button>
                {selectedIds.length > 0 ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4"/>
                          {t.history.delete} ({selectedIds.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.history.confirmDeleteTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                         {t.history.confirmDeleteDescription.replace('{count}', selectedIds.length.toString())}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.history.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelected}>{t.history.delete}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" >
                        <Trash2 className="mr-2 h-4 w-4"/>{t.history.deleteAll}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.history.confirmDeleteAllTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{t.history.confirmDeleteAllDescription}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.history.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAll}>{t.history.deleteAll}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
            </div>
        )}

        {renderContent()}
      </div>
    </main>
  );
}
