'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { AuthError, sendPasswordResetEmail, getRedirectResult } from 'firebase/auth';
import { DialogTitle } from '@radix-ui/react-dialog';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormMessage, FormItem, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateGoogleSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { useAuthModal } from '@/app/context/auth-modal-context';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
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


function LoginView() {
  const { setView, closeModal } = useAuthModal();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { locale } = useLanguage();
  const t = translations[locale];
  
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleAuthSuccess = () => {
    toast({ variant: 'success', title: t.login.successTitle, description: t.login.welcomeBack });
    closeModal();
    router.refresh();
  };

  const handleAuthError = (error: AuthError, provider: 'email' | 'google' | 'redirect') => {
    let title = t.login.failedTitle;
    let description = 'An unexpected error occurred. Please try again.';

    if (provider === 'email') {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            form.setError('password', {
                type: 'manual',
                message: t.login.wrongPassword,
            });
            description = t.login.wrongPassword;
        } else {
            description = t.login.checkCredentials;
        }
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
    if (!auth) return;
    
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          handleAuthSuccess();
        }
      })
      .catch((error) => {
        handleAuthError(error, 'redirect');
      });
  }, [auth]);

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    if (!auth) return;
    setIsLoading(true);
    initiateEmailSignIn(auth, values.email, values.password, (user, error) => {
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
  }
  
  return (
    <Card className="border-0 shadow-none">
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
                        <Input placeholder={t.login.emailPlaceholder} {...field} />
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
                            <Button
                                type="button"
                                variant="link"
                                className="p-0 h-auto text-sm font-medium text-primary hover:underline"
                                onClick={() => setView('forgot_password')}
                            >
                                {t.login.forgotPassword}
                            </Button>
                        </div>
                        <FormControl>
                        <Input type="password" placeholder={t.login.passwordPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : t.login.button}
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
            {t.login.noAccount}{' '}
            <Button variant="link" className="p-0 h-auto font-medium text-primary hover:underline" onClick={() => setView('signup')}>
              {t.login.registerLink}
            </Button>
          </p>
        </CardContent>
      </Card>
  )
}

function SignupView() {
    const { setView, closeModal } = useAuthModal();
    const [isLoading, setIsLoading] = useState(false);
    const { locale } = useLanguage();
    const t = translations[locale];
    
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: { email: '', password: '' },
    });

    const handleAuthSuccess = () => {
        toast({ title: t.register.successTitle, description: t.register.successDescription });
        closeModal();
        router.refresh();
    };

    const handleAuthError = (error: AuthError) => {
        toast({
            variant: 'destructive',
            title: t.register.failedTitle,
            description: error.message || t.register.emailInUse,
        });
        setIsLoading(false);
    };

    useEffect(() => {
        if (!auth) return;
        
        getRedirectResult(auth)
          .then((result) => {
            if (result) {
              handleAuthSuccess();
            }
          })
          .catch((error) => {
            handleAuthError(error);
          });
    }, [auth]);

    const onEmailSubmit = (values: z.infer<typeof signupSchema>) => {
        if (!auth) return;
        setIsLoading(true);
        initiateEmailSignUp(auth, values.email, values.password, (user, error) => {
            if (user) {
                handleAuthSuccess();
            } else if (error) {
                handleAuthError(error);
            }
        });
    };

    return (
        <Card className="border-0 shadow-none">
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : t.register.button}
                        </Button>
                    </form>
                </Form>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                    {t.register.haveAccount}{' '}
                    <Button variant="link" className="p-0 h-auto font-medium text-primary hover:underline" onClick={() => setView('login')}>
                        {t.register.loginLink}
                    </Button>
                </p>
            </CardContent>
        </Card>
    );
}

function ForgotPasswordView() {
    const { setView } = useAuthModal();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const auth = useAuth();
    const { toast } = useToast();
    const { locale } = useLanguage();
    const t = translations[locale];

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
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
        <Card className="border-0 shadow-none">
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
                        <Button variant="link" onClick={() => setView('login')}>Back to Log In</Button>
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
                 {!isSubmitted && (
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        <Button variant="link" className="p-0 h-auto font-medium text-primary hover:underline" onClick={() => setView('login')}>
                            Back to Log In
                        </Button>
                    </p>
                 )}
            </CardContent>
        </Card>
    );
}

export function AuthDialog() {
  const { isOpen, view, closeModal } = useAuthModal();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // Close the modal if the user logs in successfully
  useEffect(() => {
    if (user && isOpen) {
      closeModal();
    }
  }, [user, isOpen, closeModal]);

  if (isUserLoading) return null; // Or a spinner if you prefer

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md p-0">
        <VisuallyHidden>
          <DialogTitle>Authentication Form</DialogTitle>
        </VisuallyHidden>
        {view === 'login' && <LoginView />}
        {view === 'signup' && <SignupView />}
        {view === 'forgot_password' && <ForgotPasswordView />}
      </DialogContent>
    </Dialog>
  );
}
