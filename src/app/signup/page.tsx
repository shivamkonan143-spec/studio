
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
import { AuthError, getRedirectResult } from 'firebase/auth';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.356-11.024-7.928l-6.332,5.634C9.507,41.212,16.224,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.02,35.198,44,30.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    );
}

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

  const handleAuthSuccess = () => {
    toast({ title: t.register.successTitle, description: t.register.successDescription });
    router.push('/');
  };

  const handleAuthError = (error: AuthError, provider: 'email' | 'google' | 'redirect') => {
    let title = t.register.failedTitle;
    let description = 'An unexpected error occurred. Please try again.';

    if (provider === 'email') {
        description = t.register.emailInUse;
    } else if (provider === 'google' || provider === 'redirect') {
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

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!auth || isUserLoading || user) return;
    
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          handleAuthSuccess();
        }
      })
      .catch((error) => {
        handleAuthError(error, 'redirect');
      });
  }, [auth, isUserLoading, user]);

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

  const handleGoogleSignIn = () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    initiateGoogleSignIn(auth);
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

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                  {t.login.continueWith}
                  </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
              {t.login.google}
            </Button>

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

    