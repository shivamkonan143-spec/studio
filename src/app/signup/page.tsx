
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
import { initiateEmailSignUp, initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { AuthError } from 'firebase/auth';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});


export default function SignUpPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleAuthSuccess = () => {
    toast({ title: t.register.successTitle, description: t.register.successDescription });
    router.push('/');
  };

  const handleAuthError = (error: AuthError, provider: 'email' | 'google') => {
    let title = t.register.failedTitle;
    let description = 'An unexpected error occurred. Please try again.';

    if (provider === 'email') {
        description = t.register.emailInUse;
    } else if (provider === 'google') {
        title = t.login.googleFailed;
        description = 'Could not sign in with Google. Please try again.';
    }
      
    toast({
      variant: 'destructive',
      title: title,
      description: error.message || description,
    });

    setIsLoading(false);
    setIsGoogleLoading(false);
  };

  const onEmailSubmit = (values: z.infer<typeof formSchema>) => {
    if (!auth) return;
    setIsLoading(true);
    initiateEmailSignUp(auth, values.email, values.password, (user, error) => {
       if (user) {
        handleAuthSuccess();
       } else if (error) {
        handleAuthError(error, 'email');
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
          <CardTitle>{t.register.title}</CardTitle>
          <CardDescription>{t.register.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.register.emailLabel}</FormLabel>
                        <FormControl>
                        <Input placeholder={t.register.emailPlaceholder} {...field} />
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
                        <FormLabel>{t.register.passwordLabel}</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder={t.register.passwordPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : t.register.button}
                </Button>
                </form>
            </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t.register.haveAccount}{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t.register.loginLink}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
