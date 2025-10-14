'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useState } from 'react';
import { AuthError, sendPasswordResetEmail } from 'firebase/auth';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormMessage, FormItem, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();
  const { locale } = useLanguage();
  const t = translations[locale];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!auth) return;
    setIsLoading(true);
    sendPasswordResetEmail(auth, values.email)
      .then(() => {
        setIsSubmitted(true);
        setIsLoading(false);
        toast({
          title: t.forgotPassword.checkEmailToast,
          description: t.forgotPassword.resetLinkSent.replace('{email}', values.email),
        });
      })
      .catch((error: AuthError) => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: t.forgotPassword.failedToast,
          description: error.message || 'An unexpected error occurred. Please try again.',
        });
      });
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t.forgotPassword.title}</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? t.forgotPassword.descriptionSubmitted
              : t.forgotPassword.description
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <Mail className="h-16 w-16 text-primary" />
              <h3 className="text-xl font-semibold">{t.forgotPassword.submittedTitle}</h3>
              <p className="text-muted-foreground">
                {t.forgotPassword.submittedDescription}{' '}
                <span className="font-medium text-foreground">{form.getValues('email')}</span>.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.forgotPassword.emailLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.forgotPassword.emailPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : t.forgotPassword.button}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
