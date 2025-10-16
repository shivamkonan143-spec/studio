'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormMessage, FormItem, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { AuthError } from 'firebase/auth';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { locale } = useLanguage();
  const t = translations[locale];
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleAuthSuccess = () => {
    toast({ variant: 'success', title: t.login.successTitle, description: t.login.welcomeBack });
    router.push('/');
  };

  const handleAuthError = (error: AuthError) => {
    let title = t.login.failedTitle;
    let description = 'An unexpected error occurred. Please try again.';

    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        description = t.login.checkCredentials;
    }
      
    toast({
      variant: 'destructive',
      title: title,
      description: description,
    });

    setIsLoading(false);
  };
  
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!auth) return;
    setIsLoading(true);
    initiateEmailSignIn(auth, values.email, values.password, (user, error) => {
      if (user) {
        handleAuthSuccess();
      } else if (error) {
        handleAuthError(error);
      }
    });
  };

  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8"/>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm relative">
        <Link href="/" passHref>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4">
                <X className="h-5 w-5" />
            </Button>
        </Link>
        <CardHeader>
          <CardTitle>{t.login.title}</CardTitle>
          <CardDescription>{t.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.login.emailLabel}</FormLabel>
                        <FormControl>
                        <Input placeholder={t.login.emailPlaceholder} {...field} autoFocus={false}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center justify-between">
                            <FormLabel>{t.login.passwordLabel}</FormLabel>
                            <Link href="/forgot-password"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                {t.login.forgotPassword}
                            </Link>
                        </div>
                        <FormControl>
                        <Input type="password" placeholder={t.login.passwordPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : t.login.button}
                </Button>
                </form>
            </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t.login.noAccount}{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              {t.login.registerLink}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

    