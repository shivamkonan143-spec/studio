
'use client';

import { CheckCircle, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'phonepe';

interface PaymentMethod {
    type: PaymentMethodType;
    upiId?: string;
}


export function SubscriptionCard() {
    const { locale } = useLanguage();
    const t = translations[locale];
    const { user } = useUser();
    const { toast } = useToast();
    const firestore = useFirestore();
    const router = useRouter();

    const subscriptionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'subscriptions', 'main');
    }, [firestore, user]);
    
    const { data: subscription, isLoading: isSubscriptionLoading } = useDoc(subscriptionRef);
    const isSubscribed = subscription?.active === true;
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({ type: 'upi', upiId: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubscribeClick = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setIsDialogOpen(true);
    };

    const handleConfirm = () => {
        setStep(2);
    };
    
    const handlePayNow = () => {
        if (paymentMethod.type === 'upi' && !paymentMethod.upiId) {
            toast({
                variant: 'destructive',
                title: t.common.error,
                description: t.payment.upiIdRequired,
            });
            return;
        }
        setStep(3);
    };

    const handleCompletePayment = async () => {
        if (!user || !firestore) return;
        setIsProcessing(true);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        try {
            await setDoc(doc(firestore, 'users', user.uid, 'subscriptions', 'main'), {
                active: true,
                subscribedAt: serverTimestamp(),
                expiresAt: expiresAt,
                paymentMethod: paymentMethod.type,
                ...(paymentMethod.type === 'upi' && { upiId: paymentMethod.upiId })
            }, { merge: true });

            toast({
                variant: 'success',
                title: t.subscription.successTitle,
                description: t.subscription.successDescription,
            });

        } catch (error: any) {
            console.error("Subscription failed:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to update subscription.',
            })
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
            setStep(1);
        }
    };
    
    const renderDialogContent = () => {
        if (step === 1) {
            return (
                <>
                    <DialogHeader>
                        <DialogTitle>{t.subscription.dialogConfirmTitle}</DialogTitle>
                        <DialogDescription>{t.subscription.dialogConfirmDescription}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <span className="font-medium">{t.subscription.term}</span>
                            <span className="font-bold">{t.subscription.price}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t.subscription.cancel}</Button>
                        <Button onClick={handleConfirm}>{t.subscription.buttonSubscribe}</Button>
                    </DialogFooter>
                </>
            );
        }
        if (step === 2) {
             return (
                <>
                    <DialogHeader>
                        <DialogTitle>{t.subscription.dialogPaymentTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <RadioGroup 
                            value={paymentMethod.type} 
                            onValueChange={(value: PaymentMethodType) => setPaymentMethod({ type: value, upiId: paymentMethod.upiId })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="upi" id="upi" />
                                <Label htmlFor="upi">{t.payment.upi}</Label>
                            </div>
                            {paymentMethod.type === 'upi' && (
                                <div className="pl-6 pt-2 pb-2">
                                    <Label htmlFor="upiId" className="text-xs text-muted-foreground">{t.payment.upiId}</Label>
                                    <Input 
                                        id="upiId" 
                                        placeholder={t.payment.upiIdPlaceholder}
                                        value={paymentMethod.upiId}
                                        onChange={(e) => setPaymentMethod({...paymentMethod, upiId: e.target.value})}
                                        className="mt-1"
                                    />
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="phonepe" id="phonepe" />
                                <Label htmlFor="phonepe">{t.payment.phonepe}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card">{t.payment.card}</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="netbanking" id="netbanking" />
                                <Label htmlFor="netbanking">{t.payment.netbanking}</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setStep(1)}>{t.subscription.back}</Button>
                        <Button onClick={handlePayNow}>{t.subscription.payNow}</Button>
                    </DialogFooter>
                </>
            );
        }
        if (step === 3) {
            return (
                <>
                    <DialogHeader>
                        <DialogTitle>{t.subscription.dialogPaymentTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center">
                        <p>{t.subscription.completePayment}...</p>
                    </div>
                    <DialogFooter>
                        <Button 
                            className="w-full"
                            onClick={handleCompletePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? t.common.loading : t.subscription.completePayment}
                        </Button>
                    </DialogFooter>
                </>
            )
        }
    };


    return (
        <>
            <Card className="overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-gradient-to-br from-accent/10 via-transparent to-transparent">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <Diamond className="w-6 h-6 text-accent" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                            {t.subscription.title}
                        </CardTitle>
                    </div>
                    <CardDescription>{t.subscription.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-medium">{t.subscription.benefit}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">{t.subscription.price}</span>
                            <span className="text-lg text-muted-foreground line-through">{t.subscription.originalPrice}</span>
                            <span className="text-muted-foreground">{t.subscription.duration}</span>
                        </div>
                        {isSubscribed ? (
                            <Badge variant="success" className="w-full text-center justify-center text-lg py-2">
                                {t.subscription.statusSubscribed}
                            </Badge>
                        ) : (
                            <Button size="lg" variant="destructive" className="w-full" onClick={handleSubscribeClick} disabled={isSubscriptionLoading}>
                                {t.subscription.buttonSubscribe}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    {renderDialogContent()}
                </DialogContent>
            </Dialog>
        </>
    );
}
