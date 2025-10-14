
'use client';

import { CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';

export function SubscriptionCard() {
    const { locale } = useLanguage();
    const t = translations[locale].subscription;

    return (
        <Card className="overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-gradient-to-br from-primary/10 via-transparent to-transparent">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Star className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {t.title}
                    </CardTitle>
                </div>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{t.benefit}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{t.price}</span>
                        <span className="text-lg text-muted-foreground line-through">{t.originalPrice}</span>
                        <span className="text-muted-foreground">{t.duration}</span>
                    </div>
                    <Button size="lg" className="w-full">
                        {t.buttonSubscribe}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
