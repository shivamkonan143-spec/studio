
'use client';

import { Header } from '@/app/components/header';
import { YoutubeDownloaderInput } from '@/app/components/video-downloader';
import { SubscriptionCard } from '@/app/components/subscription-card';
import { SocialLinks } from '@/app/components/social-links';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const subscriptionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'subscriptions', 'main');
  }, [firestore, user]);

  const { data: subscription, isLoading: isSubscriptionLoading } = useDoc(subscriptionRef);
  const isSubscribed = subscription?.active === true;
  
  // Determine if the card should be shown.
  // We wait for both user and subscription to finish loading.
  // Show if:
  // 1. Not loading user or subscription.
  // 2. The user is not subscribed.
  const showSubscriptionCard = !isUserLoading && !isSubscriptionLoading && !isSubscribed;


  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(223,200,242,0.3),rgba(255,255,255,0))]">
      <Header />
      <div className="w-full max-w-2xl space-y-6">
        <YoutubeDownloaderInput />
        {showSubscriptionCard && <SubscriptionCard />}
        <SocialLinks />
      </div>
    </main>
  );
}
