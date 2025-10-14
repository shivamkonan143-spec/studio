
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/header';
import { YoutubeTool } from '@/app/components/video-downloader';
import { AdPlaceholder } from '@/app/components/ad-placeholder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Gem } from 'lucide-react';

export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const subscribed = localStorage.getItem('isSubscribed') === 'true';
    setIsSubscribed(subscribed);
  }, []);

  const handleSubscriptionChange = (subscribed: boolean) => {
    setIsSubscribed(subscribed);
    localStorage.setItem('isSubscribed', String(subscribed));
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12">
      <Header />
      <div className="w-full max-w-2xl space-y-6">
        <YoutubeTool />

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gem className="h-5 w-5 text-primary"/>
                    <span>Premium Subscription</span>
                </CardTitle>
                <CardDescription>
                    Subscribe to remove all ads and support the developer.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                        Remove Ads
                        </p>
                        <p className="text-sm text-muted-foreground">
                        Enjoy an ad-free experience.
                        </p>
                    </div>
                    <Switch
                        checked={isSubscribed}
                        onCheckedChange={handleSubscriptionChange}
                        aria-readonly
                    />
                </div>
            </CardContent>
        </Card>

        {!isSubscribed && <AdPlaceholder />}
      </div>
    </main>
  );
}
