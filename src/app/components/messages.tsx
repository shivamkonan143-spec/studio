
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

type Message = {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
};

export function Messages({ children }: { children: React.ReactNode }) {
  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'messages'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Messages & Announcements</DialogTitle>
          <DialogDescription>
            Here are the latest updates from the developer.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-4">
            {isLoading && (
              <>
                <MessageSkeleton />
                <MessageSkeleton />
                <MessageSkeleton />
              </>
            )}
            {!isLoading && messages && messages.length > 0 ? (
              messages.map((message, index) => (
                <div key={message.id}>
                  <div className="space-y-1">
                    <h4 className="font-medium">{message.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {message.content}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      {formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true })}
                    </p>
                  </div>
                  {index < messages.length - 1 && <Separator className="my-4" />}
                </div>
              ))
            ) : (
              !isLoading && (
                <div className="flex flex-col items-center justify-center space-y-2 text-center py-10">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium">No Messages Yet</p>
                    <p className="text-sm text-muted-foreground">Check back later for new announcements.</p>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


function MessageSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-3 w-1/4 mt-1" />
        </div>
    )
}
