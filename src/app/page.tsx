
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/header';
import { YoutubeTool } from '@/app/components/video-downloader';
import { AdPlaceholder } from '@/app/components/ad-placeholder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Gem, Wallet, CreditCard, Landmark, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"


export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'methods'>('confirm');
  const { toast } = useToast();

  useEffect(() => {
    const subscribed = localStorage.getItem('isSubscribed') === 'true';
    setIsSubscribed(subscribed);
  }, []);

  const handleSubscription = () => {
    setIsSubscribed(true);
    localStorage.setItem('isSubscribed', 'true');
    setIsDialogOpen(false);
    setPaymentStep('confirm'); // Reset step for next time
    toast({
      title: 'Subscription Successful!',
      description: 'Thank you for subscribing. Enjoy an ad-free experience.',
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsDialogOpen(false);
      // Reset to confirmation step after a short delay to allow animation
      setTimeout(() => {
        setPaymentStep('confirm');
      }, 300);
    } else {
      setIsDialogOpen(true);
    }
  }

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
                       <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                        <DialogTrigger asChild>
                           <Button>Subscribe</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {paymentStep === 'confirm' ? 'Confirm Subscription' : 'Choose Payment Method'}
                            </DialogTitle>
                            {paymentStep === 'confirm' && (
                                <DialogDescription>
                                    You are about to subscribe for an ad-free experience.
                                </DialogDescription>
                            )}
                          </DialogHeader>

                          {paymentStep === 'confirm' ? (
                            <>
                              <div className="py-4">
                                <div className="flex justify-between items-baseline p-4 rounded-lg bg-muted">
                                    <span className="font-medium">1 Month Subscription</span>
                                    <span className="text-2xl font-bold">₹50</span>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => handleDialogClose(false)}>Cancel</Button>
                                <Button onClick={() => setPaymentStep('methods')}>Pay Now</Button>
                              </DialogFooter>
                            </>
                          ) : (
                            <>
                               <div className="py-4">
                                    <RadioGroup defaultValue="upi" className="space-y-4">
                                        <Label
                                            htmlFor="upi"
                                            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Wallet className="h-6 w-6" />
                                                <span className="font-medium">UPI</span>
                                            </div>
                                            <RadioGroupItem value="upi" id="upi" />
                                        </Label>
                                         <Label
                                            htmlFor="card"
                                            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="h-6 w-6" />
                                                <span className="font-medium">Credit/Debit Card</span>
                                            </div>
                                            <RadioGroupItem value="card" id="card" />
                                        </Label>
                                         <Label
                                            htmlFor="netbanking"
                                            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Landmark className="h-6 w-6" />
                                                <span className="font-medium">Net Banking</span>
                                            </div>
                                            <RadioGroupItem value="netbanking" id="netbanking" />
                                        </Label>
                                    </RadioGroup>
                               </div>
                               <DialogFooter className="sm:justify-between">
                                 <Button variant="outline" onClick={() => setPaymentStep('confirm')}>
                                    <ArrowLeft className="mr-2 h-4 w-4"/>
                                    Back
                                 </Button>
                                 <Button onClick={handleSubscription}>Complete Payment</Button>
                               </DialogFooter>
                            </>
                          )}
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
