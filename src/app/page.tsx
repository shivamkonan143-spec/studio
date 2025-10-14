
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, isBefore } from 'date-fns';
import { Header } from '@/app/components/header';
import { YoutubeTool } from '@/app/components/video-downloader';
import { AdPlaceholder } from '@/app/components/ad-placeholder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Gem, Wallet, CreditCard, Landmark, ArrowLeft, Loader2, Instagram, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useMemoFirebase, useDoc, setDocumentNonBlocking } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';


type Subscription = {
  active: boolean;
  expiresAt: Timestamp | null;
  subscribedAt: Timestamp;
}

const SocialFollowCard = () => {
  const { locale } = useLanguage();
  const t = translations[locale];

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        <p className="text-sm font-medium text-red-500">{t.videoDownloader.subscribeNow}</p>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <a href="https://www.instagram.com/lootbuy_india?igsh=MTk5Ynd1OW82ejY2ag==" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-6 w-6 text-pink-500" />
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href="https://youtube.com/@onlyp4x?si=B1oI7iefbToLvw1e" target="_blank" rel="noopener noreferrer">
              <Youtube className="h-6 w-6 text-red-600" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'methods'>('confirm');
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { locale } = useLanguage();
  const t = translations[locale];


  const userSubscriptionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'subscriptions', 'main');
  }, [firestore, user]);

  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useDoc<Subscription>(userSubscriptionRef);

  useEffect(() => {
    if (isSubscriptionLoading) return;
    if (!user || !subscriptionData) {
      setIsSubscribed(false);
      return;
    }
  
    if (subscriptionData.active && subscriptionData.expiresAt) {
      const expiryDate = subscriptionData.expiresAt.toDate();
      if (isBefore(new Date(), expiryDate)) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
        if (subscriptionData.active && userSubscriptionRef) {
          setDocumentNonBlocking(userSubscriptionRef, { active: false }, { merge: true });
          toast({
            title: t.subscription.expiredTitle,
            description: t.subscription.expiredDescription,
          });
        }
      }
    } else {
      setIsSubscribed(false);
    }
  }, [user, subscriptionData, isSubscriptionLoading, userSubscriptionRef, toast, t]);


  const handleSubscription = async () => {
    if (!userSubscriptionRef) {
      toast({
        variant: "destructive",
        title: t.common.error,
        description: t.subscription.errorDescription,
      });
      return;
    }

    const expiryDate = addDays(new Date(), 30);
    const newSubscriptionData = {
      active: true,
      subscribedAt: serverTimestamp(),
      expiresAt: expiryDate,
    };
    
    setDocumentNonBlocking(userSubscriptionRef, newSubscriptionData, { merge: true });

    setIsSubscribed(true);
    setIsDialogOpen(false);
    setPaymentStep('confirm');
    toast({
      title: t.subscription.successTitle,
      description: t.subscription.successDescription,
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsDialogOpen(false);
      setTimeout(() => {
        setPaymentStep('confirm');
      }, 300);
    } else {
      setIsDialogOpen(true);
    }
  }
  
  const handleSubscribeClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      setIsDialogOpen(true);
    }
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
                    <span>{t.subscription.title}</span>
                </CardTitle>
                <CardDescription>
                    {t.subscription.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                        {t.subscription.benefit}
                        </p>
                        <p className="text-sm text-muted-foreground">
                        <span className="font-bold text-foreground text-base mr-2">{t.subscription.price}</span>
                        <span className="line-through">{t.subscription.originalPrice}</span> {t.subscription.duration}
                        </p>
                    </div>
                    {isSubscriptionLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin"/>
                    ) : isSubscribed ? (
                       <Badge variant="secondary">{t.subscription.statusSubscribed}</Badge>
                    ) : (
                      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                        <DialogTrigger asChild>
                          <Button onClick={handleSubscribeClick}>{t.subscription.buttonSubscribe}</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {paymentStep === 'confirm' ? t.subscription.dialogConfirmTitle : t.subscription.dialogPaymentTitle}
                            </DialogTitle>
                            {paymentStep === 'confirm' && (
                                <DialogDescription>
                                    {t.subscription.dialogConfirmDescription}
                                </DialogDescription>
                            )}
                          </DialogHeader>

                          {paymentStep === 'confirm' ? (
                            <>
                              <div className="py-4">
                                <div className="flex justify-between items-baseline p-4 rounded-lg bg-muted">
                                    <span className="font-medium">{t.subscription.term}</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">{t.subscription.price}</span>
                                        <span className="text-lg font-medium line-through text-muted-foreground">{t.subscription.originalPrice}</span>
                                    </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => handleDialogClose(false)}>{t.subscription.cancel}</Button>
                                <Button onClick={() => setPaymentStep('methods')}>{t.subscription.payNow}</Button>
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
                                                <span className="font-medium">{t.payment.upi}</span>
                                            </div>
                                            <RadioGroupItem value="upi" id="upi" />
                                        </Label>
                                        <Label
                                            htmlFor="card"
                                            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="h-6 w-6" />
                                                <span className="font-medium">{t.payment.card}</span>
                                            </div>
                                            <RadioGroupItem value="card" id="card" />
                                        </Label>
                                        <Label
                                            htmlFor="netbanking"
                                            className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Landmark className="h-6 w-6" />
                                                <span className="font-medium">{t.payment.netbanking}</span>
                                            </div>
                                            <RadioGroupItem value="netbanking" id="netbanking" />
                                        </Label>
                                    </RadioGroup>
                              </div>
                              <DialogFooter className="sm:justify-between">
                                <Button variant="outline" onClick={() => setPaymentStep('confirm')}>
                                    <ArrowLeft className="mr-2 h-4 w-4"/>
                                    {t.subscription.back}
                                </Button>
                                <Button onClick={handleSubscription}>{t.subscription.completePayment}</Button>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                </div>
            </CardContent>
        </Card>
        
        <SocialFollowCard />

        {!isSubscribed && <AdPlaceholder />}
      </div>
    </main>
  );
}
