
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import {
  getAuth,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError,
  User,
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase/provider';

type View = 'login' | 'signup' | 'forgot-password';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: View;
}

export function AuthDialog({
  open,
  onOpenChange,
  initialView = 'login',
}: AuthDialogProps) {
  const [view, setView] = useState<View>(initialView);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset to login view when dialog is closed
      setTimeout(() => setView('login'), 300);
    }
    onOpenChange(isOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        {view === 'login' && <LoginView setView={setView} onAuthSuccess={() => handleOpenChange(false)} />}
        {view === 'signup' && <SignupView setView={setView} onAuthSuccess={() => handleOpenChange(false)} />}
        {view === 'forgot-password' && <ForgotPasswordView setView={setView} />}
      </DialogContent>
    </Dialog>
  );
}

// Helper for error messages
const getAuthErrorMessage = (errorCode: string, locale: 'en' | 'hi') => {
    const t = translations[locale];
    switch (errorCode) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
             return t.login.checkCredentials;
        case 'auth/email-already-in-use':
            return t.register.emailInUse;
        case 'auth/invalid-email':
            return 'Please enter a valid email address.'; // Universal
        case 'auth/unauthorized-domain':
             return 'This domain is not authorized for authentication. Please contact support.';
        default:
            return 'An unexpected error occurred. Please try again.'; // Universal
    }
};

interface ViewProps {
  setView: (view: View) => void;
  onAuthSuccess?: () => void;
}

function LoginView({ setView, onAuthSuccess }: ViewProps) {
    const { toast } = useToast();
    const { locale } = useLanguage();
    const t = translations[locale];
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();


    const handleAuthSuccess = useCallback((user: User) => {
        toast({
            variant: 'success',
            title: t.login.successTitle,
            description: t.login.welcomeBack,
        });
        onAuthSuccess?.();
    }, [onAuthSuccess, t.login.successTitle, t.login.welcomeBack, toast]);

    const handleAuthError = useCallback((error: any) => {
        setIsLoading(false);
        const errorCode = error.code || (error.isGenkitError ? error.data?.code : 'unknown');
        toast({
            variant: 'destructive',
            title: t.login.failedTitle,
            description: getAuthErrorMessage(errorCode, locale),
        });
    }, [locale, t.login.failedTitle, toast]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await signIn(email, password);
            handleAuthSuccess(userCredential.user);
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            handleAuthSuccess(result.user);
        } catch (error) {
            handleAuthError(error as AuthError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <DialogHeader className="p-6 pb-4">
                <DialogTitle>{t.login.title}</DialogTitle>
                <DialogDescription>{t.login.description}</DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.login.emailLabel}</Label>
                        <Input id="email" type="email" placeholder={t.login.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t.login.passwordLabel}</Label>
                        <Input id="password" type="password" placeholder={t.login.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                     <Button type="button" variant="link" className="p-0 h-auto" onClick={() => setView('forgot-password')}>
                        {t.login.forgotPassword}
                    </Button>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t.login.button}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                    Google
                </Button>
            </div>
            <DialogFooter className="p-4 pt-0 bg-muted/50 text-sm">
                <p>
                    {t.login.noAccount}{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setView('signup')}>
                        {t.login.registerLink}
                    </Button>
                </p>
            </DialogFooter>
        </>
    );
}

function SignupView({ setView, onAuthSuccess }: ViewProps) {
    const { toast } = useToast();
    const { locale } = useLanguage();
    const t = translations[locale];
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp } = useAuth();
    
    const handleAuthSuccess = useCallback((user: User) => {
        toast({
            variant: 'success',
            title: t.register.successTitle,
            description: t.register.successDescription,
        });
        onAuthSuccess?.();
    }, [onAuthSuccess, t.register.successTitle, t.register.successDescription, toast]);
    
    const handleAuthError = useCallback((error: any) => {
        setIsLoading(false);
        const errorCode = error.code || (error.isGenkitError ? error.data?.code : 'unknown');
        toast({
            variant: 'destructive',
            title: t.register.failedTitle,
            description: getAuthErrorMessage(errorCode, locale),
        });
    }, [locale, t.register.failedTitle, toast]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await signUp(email, password);
            handleAuthSuccess(userCredential.user);
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            handleAuthSuccess(result.user);
        } catch (error) {
            handleAuthError(error as AuthError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <DialogHeader className="p-6 pb-4">
                <DialogTitle>{t.register.title}</DialogTitle>
                <DialogDescription>{t.register.description}</DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.register.emailLabel}</Label>
                        <Input id="email" type="email" placeholder={t.register.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t.register.passwordLabel}</Label>
                        <Input id="password" type="password" placeholder={t.register.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t.register.button}
                    </Button>
                </form>
                
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                    Google
                </Button>
            </div>
            <DialogFooter className="p-4 pt-0 bg-muted/50 text-sm">
                <p>
                    {t.register.haveAccount}{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setView('login')}>
                        {t.register.loginLink}
                    </Button>
                </p>
            </DialogFooter>
        </>
    );
}

function ForgotPasswordView({ setView }: ViewProps) {
    const { toast } = useToast();
    const { locale } = useLanguage();
    const t = translations[locale];
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState('');

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setIsSubmitted(true);
             toast({
                title: t.forgotPassword.submittedTitle,
                description: `${t.forgotPassword.submittedDescription} ${email}.`,
            });
        } catch (error) {
            const authError = error as AuthError;
            toast({
                variant: 'destructive',
                title: t.forgotPassword.failedToast,
                description: getAuthErrorMessage(authError.code, locale),
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <>
                <DialogHeader className="p-6">
                    <DialogTitle>{t.forgotPassword.submittedTitle}</DialogTitle>
                    <DialogDescription>{t.forgotPassword.submittedDescription}</DialogDescription>
                </DialogHeader>
                <div className="px-6 pb-6">
                    <p className="text-center text-sm text-muted-foreground">
                        {t.forgotPassword.resetLinkSent.replace('{email}', email)}
                    </p>
                </div>
                <DialogFooter className="p-4 pt-0 bg-muted/50 text-sm">
                    <Button variant="link" className="p-0 h-auto" onClick={() => setView('login')}>
                        Back to Login
                    </Button>
                </DialogFooter>
            </>
        )
    }

    return (
        <>
            <DialogHeader className="p-6">
                <DialogTitle>{t.forgotPassword.title}</DialogTitle>
                <DialogDescription>{t.forgotPassword.description}</DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 space-y-4">
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.forgotPassword.emailLabel}</Label>
                        <Input id="email" type="email" placeholder={t.forgotPassword.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t.forgotPassword.button}
                    </Button>
                </form>
            </div>
            <DialogFooter className="p-4 pt-0 bg-muted/50 text-sm">
                 <Button variant="link" className="p-0 h-auto" onClick={() => setView('login')}>
                    Back to Login
                </Button>
            </DialogFooter>
        </>
    );
}

    
