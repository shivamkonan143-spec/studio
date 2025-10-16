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
import { useAuth, useUser } from '@/firebase';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

type View = 'login' | 'register' | 'forgot-password' | 'forgot-password-submitted';

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


function AuthForm({ onAuthSuccess, onAuthError }: { onAuthSuccess: (user: User) => void, onAuthError: (error: any) => void }) {
    const { locale } = useLanguage();
    const t = translations[locale];
    const auth = useAuth();
    const [view, setView] = useState<View>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
    
    const handleRegister = async (e: React.FormEvent) => {
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

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setView('forgot-password-submitted');
        } catch (error) {
            onAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentTitle = {
        login: t.login.title,
        register: t.register.title,
        'forgot-password': t.forgotPassword.title,
        'forgot-password-submitted': t.forgotPassword.submittedTitle,
    }[view];


    const renderContent = () => {
        switch(view) {
            case 'login':
                return (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative">
                           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                           <Input id="login-email" type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-b-purple-500 transition" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-b-purple-500 transition" />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:bg-transparent hover:text-white" onClick={() => setShowPassword(p => !p)}>
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Checkbox id="remember-me" className="border-gray-400" />
                                <Label htmlFor="remember-me" className="text-gray-300">Remember me</Label>
                            </div>
                            <Button type="button" variant="link" className="p-0 h-auto text-sm text-gray-300 hover:text-white" onClick={() => setView('forgot-password')}>
                                Forgot Password?
                            </Button>
                        </div>
                        <Button type="submit" className="w-full font-bold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "LOGIN"}
                        </Button>
                        <p className="text-center text-sm text-gray-300">
                           Need an account?{' '}
                            <Button type="button" variant="link" className="p-0 h-auto text-sm text-blue-400 hover:text-blue-300" onClick={() => setView('register')}>
                                Register
                            </Button>
                        </p>
                    </form>
                );
            case 'register':
                 return (
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="relative">
                           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                           <Input id="register-email" type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-b-purple-500 transition" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input id="register-password" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-b-purple-500 transition" />
                             <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:bg-transparent hover:text-white" onClick={() => setShowPassword(p => !p)}>
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                        </div>
                        <Button type="submit" className="w-full font-bold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "REGISTER"}
                        </Button>
                        <p className="text-center text-sm text-gray-300">
                           Already have an account?{' '}
                            <Button type="button" variant="link" className="p-0 h-auto text-sm text-blue-400 hover:text-blue-300" onClick={() => setView('login')}>
                                Log in
                            </Button>
                        </p>
                    </form>
                );
            case 'forgot-password':
                return (
                     <form onSubmit={handlePasswordReset} className="space-y-6">
                        <p className="text-center text-sm text-gray-300">
                            {t.forgotPassword.description}
                        </p>
                        <div className="relative">
                           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                           <Input id="reset-email" type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-b-purple-500 transition" />
                        </div>
                        <Button type="submit" className="w-full font-bold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t.forgotPassword.button}
                        </Button>
                         <p className="text-center text-sm text-gray-300">
                            <Button type="button" variant="link" className="p-0 h-auto text-sm text-blue-400 hover:text-blue-300" onClick={() => setView('login')}>
                                Back to Login
                            </Button>
                        </p>
                    </form>
                );
            case 'forgot-password-submitted':
                 return (
                    <div className="text-center space-y-4">
                        <p className="text-gray-300">{t.forgotPassword.resetLinkSent.replace('{email}', email)}</p>
                        <Button variant="link" className="p-0 h-auto text-sm text-blue-400 hover:text-blue-300" onClick={() => setView('login')}>
                            Back to Login
                        </Button>
                    </div>
                );
        }
    }

    return (
        <div className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8 text-white">
            <div className="text-center mb-8">
                <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
                    <UserIcon className="h-12 w-12 text-white/70" />
                </div>
                <h1 className="text-2xl font-bold">{currentTitle}</h1>
            </div>
            {renderContent()}
        </div>
    )
}

function AuthPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { locale } = useLanguage();
    const t = translations[locale];
    const { toast } = useToast();
    const [isRedirecting, setIsRedirecting] = useState(true);

    const handleAuthSuccess = useCallback((user: User) => {
        toast({
            variant: 'success',
            title: t.login.successTitle,
            description: t.login.welcomeBack,
        });
        const redirectUrl = searchParams.get('redirect') || '/';
        router.replace(redirectUrl);
    }, [toast, searchParams, router, t]);

    const handleAuthError = useCallback((error: any) => {
        const errorCode = error.code || 'unknown';
        toast({
            variant: 'destructive',
            title: t.login.failedTitle,
            description: getAuthErrorMessage(errorCode, locale),
        });
    }, [toast, locale, t]);


    useEffect(() => {
        if (!auth) {
            setIsRedirecting(false);
            return;
        }
        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    handleAuthSuccess(result.user);
                } else {
                     setIsRedirecting(false);
                }
            })
            .catch((error) => {
                handleAuthError(error);
                setIsRedirecting(false);
            });
    }, [auth, handleAuthSuccess, handleAuthError]);
    

    useEffect(() => {
        if (!isUserLoading && user && !isRedirecting) {
            const redirectUrl = searchParams.get('redirect') || '/';
            router.replace(redirectUrl);
        }
    }, [user, isUserLoading, router, searchParams, isRedirecting]);

    if (isUserLoading || user || isRedirecting) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center login-background">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 login-background">
            <div className="absolute top-4 left-4">
                <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
            <AuthForm 
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
            />
        </div>
    );
}


export default function LoginPage() {
    // This outer component is needed to wrap the page with Firebase context if it's not already in the layout.
    // In this case, we have a specific layout for the login page, so we can use the provider here.
    // If your app has Firebase available globally in the root layout, you might not need this.
    // However, this structure provides the `useAuth` hook with the necessary context.
    return <AuthPage />;
}

    