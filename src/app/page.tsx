
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/header';
import { YoutubeTool } from '@/app/components/video-downloader';
import { AdPlaceholder } from '@/app/components/ad-placeholder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Gem } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const subscribed = localStorage.getItem('isSubscribed') === 'true';
    setIsSubscribed(subscribed);
  }, []);

  const handleSubscription = () => {
    setIsSubscribed(true);
    localStorage.setItem('isSubscribed', 'true');
    setIsDialogOpen(false);
    toast({
      title: 'Subscription Successful!',
      description: 'Thank you for subscribing. Enjoy an ad-free experience.',
    });
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12">
      <Header />
      <div className="w-full max-w-2xl space-y-6">
        <YoutubeTool />

        {!isSubscribed && (
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
                  <div className="flex items-center justify-between rounded-md border p-4">
                      <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                          Ad-Free Experience
                          </p>
                          <p className="text-sm text-muted-foreground">
                          ₹50 for one month
                          </p>
                      </div>
                       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                           <Button>Subscribe</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Subscription</DialogTitle>
                            <DialogDescription>
                              You are about to subscribe for an ad-free experience.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="flex justify-between items-baseline p-4 rounded-lg bg-muted">
                                <span className="font-medium">1 Month Subscription</span>
                                <span className="text-2xl font-bold">₹50</span>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubscription}>Pay Now</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                  </div>
              </CardContent>
          </Card>
        )}

        {!isSubscribed && <AdPlaceholder />}
      </div>
    </main>
  );
}
