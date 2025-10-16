
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  AuthError,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/firebase/provider';
import { useAuth } from '@/firebase/provider';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

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
            return 'Please enter a valid email address.';
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
            return 'Sign-in was cancelled. Please try again.';
        case 'auth/unauthorized-domain':
             return 'This domain is not authorized for authentication. Please contact support.';
        default:
            return `An unexpected error occurred. Please try again. (${errorCode})`;
    }
};

function LoginView({ onAuthSuccess, onAuthError }: { onAuthSuccess: (user: User) => void, onAuthError: (error: any) => void }) {
    const { locale } = useLanguage();
    const t = translations[locale];
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            onAuthSuccess(userCredential.user);
        } catch (error) {
            onAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoading(true);
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
             onAuthError(error);
             setIsLoading(false);
        }
    };

    if (showForgotPassword) {
        return <ForgotPasswordView onBack={() => setShowForgotPassword(false)} />;
    }

    return (
        <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="login-email">{t.login.emailLabel}</Label>
                    <Input id="login-email" type="email" placeholder={t.login.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="login-password">{t.login.passwordLabel}</Label>
                    <div className="relative">
                        <Input id="login-password" type={showPassword ? "text" : "password"} placeholder={t.login.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={() => setShowForgotPassword(true)}>
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
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                Sign in with Google
            </Button>
        </CardContent>
    );
}

function SignupView({ onAuthSuccess, onAuthError }: { onAuthSuccess: (user: User) => void, onAuthError: (error: any) => void }) {
    const { locale } = useLanguage();
    const t = translations[locale];
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            onAuthSuccess(userCredential.user);
        } catch (error) {
            onAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoading(true);
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            onAuthError(error as AuthError);
            setIsLoading(false);
        }
    };

    return (
        <CardContent className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="signup-email">{t.register.emailLabel}</Label>
                    <Input id="signup-email" type="email" placeholder={t.register.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-password">{t.register.passwordLabel}</Label>
                    <div className="relative">
                        <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder={t.register.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
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
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                Sign up with Google
            </Button>
        </CardContent>
    );
}

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
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
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4 p-8">
                <h3 className="text-xl font-semibold">{t.forgotPassword.submittedTitle}</h3>
                <p className="text-muted-foreground">
                    {t.forgotPassword.resetLinkSent.replace('{email}', email)}
                </p>
                <Button variant="link" className="p-0 h-auto" onClick={onBack}>
                    Back to Login
                </Button>
            </CardContent>
        )
    }

    return (
        <CardContent className="space-y-4">
            <div className="text-center mb-4">
                <h3 className="text-xl font-semibold">{t.forgotPassword.title}</h3>
                <p className="text-sm text-muted-foreground">{t.forgotPassword.description}</p>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="reset-email">{t.forgotPassword.emailLabel}</Label>
                    <Input id="reset-email" type="email" placeholder={t.forgotPassword.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.forgotPassword.button}
                </Button>
            </form>
            <Button variant="link" className="p-0 h-auto w-full text-sm" onClick={onBack}>
                Back to Login
            </Button>
        </CardContent>
    );
}

export default function LoginPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { locale } = useLanguage();
    const t = translations[locale];
    const { toast } = useToast();
    const [isRedirecting, setIsRedirecting] = useState(true);

    const handleAuthSuccess = useCallback((user: User, successTitle: string, successDescription: string) => {
        toast({
            variant: 'success',
            title: successTitle,
            description: successDescription,
        });
        const redirectUrl = searchParams.get('redirect') || '/';
        router.replace(redirectUrl);
    }, [toast, searchParams, router]);

    const handleAuthError = useCallback((error: any, failureTitle: string) => {
        const errorCode = error.code || 'unknown';
        toast({
            variant: 'destructive',
            title: failureTitle,
            description: getAuthErrorMessage(errorCode, locale),
        });
    }, [toast, locale]);


    useEffect(() => {
        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    handleAuthSuccess(result.user, t.login.successTitle, t.login.welcomeBack);
                } else {
                     setIsRedirecting(false);
                }
            })
            .catch((error) => {
                handleAuthError(error, t.login.failedTitle);
                setIsRedirecting(false);
            });
    }, [auth, handleAuthSuccess, handleAuthError, t]);
    

    useEffect(() => {
        if (!isAuthLoading && user && !isRedirecting) {
            const redirectUrl = searchParams.get('redirect') || '/';
            router.replace(redirectUrl);
        }
    }, [user, isAuthLoading, router, searchParams, isRedirecting]);

    if (isAuthLoading || user || isRedirecting) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="absolute top-4 left-4">
                <Button variant="ghost" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
            <Tabs defaultValue="register" className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{t.header.myAccount}</CardTitle>
                        <TabsList className="grid w-full grid-cols-2 mt-4">
                            <TabsTrigger value="register">{t.header.register}</TabsTrigger>
                            <TabsTrigger value="login">{t.header.login}</TabsTrigger>
                        </TabsList>
                    </CardHeader>

                    <TabsContent value="login">
                        <LoginView 
                            onAuthSuccess={(user) => handleAuthSuccess(user, t.login.successTitle, t.login.welcomeBack)}
                            onAuthError={(error) => handleAuthError(error, t.login.failedTitle)}
                        />
                    </TabsContent>
                    <TabsContent value="register">
                        <SignupView 
                            onAuthSuccess={(user) => handleAuthSuccess(user, t.register.successTitle, t.register.successDescription)}
                            onAuthError={(error) => handleAuthError(error, t.register.failedTitle)}
                        />
                    </TabsContent>
                </Card>
            </Tabs>
        </div>
    );
}
