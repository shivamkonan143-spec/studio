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
import { initiateEmailSignIn, initiateEmailSignUp, initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { useAuthModal } from '@/app/context/auth-modal-context';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Separator } from '@/components/ui/separator';

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

  const handleAuthError = (error: AuthError) => {
    let description = 'An unexpected error occurred. Please try again.';

    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        description = t.login.checkCredentials;
    }
      
    toast({
      variant: 'destructive',
      title: t.login.failedTitle,
      description: description,
    });

    setIsLoading(false);
    setIsGoogleLoading(false);
  };
  
  // Effect to handle redirect result from Google sign-in
  useEffect(() => {
    if (!auth) return;
    setIsGoogleLoading(true);
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          handleAuthSuccess();
        }
      })
      .catch((error) => {
        handleAuthError(error);
      })
      .finally(() => {
        setIsGoogleLoading(false);
      });
  }, [auth]);

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
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

  const handleGoogleSignIn = () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    initiateGoogleSignIn(auth);
  };
  
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
                        <Input placeholder={t.login.emailPlaceholder} {...field} autoFocus={false} />
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
                        Or continue with
                    </span>
                </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading || isLoading}>
                {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 11.8 244 11.8c70.3 0 129.8 27.8 174.4 72.4l-66 66C314.5 118.8 282.8 103 244 103c-83.6 0-152.2 68.2-152.2 158.8s68.6 158.8 152.2 158.8c99.3 0 133-64.2 137.5-98.3H244v-75.1h236.4c2.5 12.8 3.6 26.4 3.6 40.9z"></path></svg>
                )}
                Sign in with Google
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
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
            description: error.code === 'auth/email-already-in-use' ? t.register.emailInUse : (error.message || 'An unexpected error occurred.'),
        });
        setIsLoading(false);
        setIsGoogleLoading(false);
    };
    
    // Effect to handle redirect result from Google sign-in
    useEffect(() => {
        if (!auth) return;
        setIsGoogleLoading(true);
        getRedirectResult(auth)
          .then((result) => {
            if (result) {
              handleAuthSuccess();
            }
          })
          .catch((error) => {
            handleAuthError(error);
          })
          .finally(() => {
            setIsGoogleLoading(false);
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

    const handleGoogleSignIn = () => {
        if (!auth) return;
        setIsGoogleLoading(true);
        initiateGoogleSignIn(auth);
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
                                        <Input placeholder={t.register.emailPlaceholder} {...field} autoFocus={false}/>
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
                            Or continue with
                        </span>
                    </div>
                </div>

                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading || isLoading}>
                    {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 11.8 244 11.8c70.3 0 129.8 27.8 174.4 72.4l-66 66C314.5 118.8 282.8 103 244 103c-83.6 0-152.2 68.2-152.2 158.8s68.6 158.8 152.2 158.8c99.3 0 133-64.2 137.5-98.3H244v-75.1h236.4c2.5 12.8 3.6 26.4 3.6 40.9z"></path></svg>
                    )}
                    Sign up with Google
                </Button>

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
                        <Button variant="link" onClick={() => setView('login')}>{t.register.loginLink}</Button>
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
                             {t.register.loginLink}
                        </Button>
                    </p>
                 )}
            </CardContent>
        </Card>
    );
}

export function AuthDialog() {
  const { isOpen, view, closeModal, setView } = useAuthModal();
  const { user, isUserLoading } = useUser();

  // Close the modal if the user logs in successfully
  useEffect(() => {
    if (user && isOpen) {
      closeModal();
    }
  }, [user, isOpen, closeModal]);

  if (isUserLoading) return null; // Or a spinner if you prefer

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
    