
'use client';

import { useForm, useFormState } from 'react-hook-form';
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
import { initiateEmailSignIn, initiateGoogleSignIn, initiatePhoneSignIn, verifyOtp } from '@/firebase/non-blocking-login';
import { useEffect, useState, useRef } from 'react';
import { Loader2, X } from 'lucide-react';
import { AuthError, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const emailFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const phoneFormSchema = z.object({
    phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
    otp: z.string().optional(),
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

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);


  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phone: '' },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleAuthSuccess = () => {
    toast({ title: 'Login Successful', description: `Welcome back!` });
    router.push('/');
  };

  const handleAuthError = (error: AuthError, provider: 'email' | 'google' | 'phone') => {
    let title = 'Login Failed';
    let description = 'An unexpected error occurred. Please try again.';

    if (provider === 'email') {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            emailForm.setError('password', {
                type: 'manual',
                message: 'Wrong password. Please try again.',
            });
            description = 'Wrong password. Please try again.';
        } else {
            description = 'Please check your email and password.';
        }
    } else if (provider === 'google') {
        title = 'Google Sign-In Failed';
        description = 'Could not sign in with Google. Please try again.';
    } else if (provider === 'phone') {
        title = 'Phone Sign-In Failed';
        if (error.code === 'auth/invalid-verification-code') {
            phoneForm.setError('otp', {type: 'manual', message: 'Invalid OTP. Please try again.'});
            description = 'The OTP you entered is incorrect.';
        } else {
            description = error.message || 'Could not sign in with your phone number.';
        }
    }
      
    toast({
      variant: 'destructive',
      title: title,
      description: error.message || description,
    });

    setIsLoading(false);
    setIsGoogleLoading(false);
    setIsOtpSending(false);
    setIsOtpVerifying(false);
  };

  const onEmailSubmit = (values: z.infer<typeof emailFormSchema>) => {
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

  const setupRecaptcha = () => {
    if (!auth || !recaptchaContainerRef.current) return null;
    // Important: re-render will cause re-initialization, which can be problematic.
    // Ensure this runs only once or is safely cleaned up.
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, you can proceed with phone sign-in
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
      }
    });
    (window as any).recaptchaVerifier = verifier;
    return verifier;
  }
  
  const onPhoneSubmit = async (values: z.infer<typeof phoneFormSchema>) => {
    if (!auth) return;
  
    if (!otpSent) { // Step 1: Send OTP
      setIsOtpSending(true);
      const verifier = setupRecaptcha();
      if (!verifier) {
        setIsOtpSending(false);
        return toast({ variant: 'destructive', title: 'Error', description: 'Could not set up reCAPTCHA.'});
      }
  
      initiatePhoneSignIn(auth, `+91${values.phone}`, verifier, (confResult, error) => {
        if (confResult) {
          setConfirmationResult(confResult);
          setOtpSent(true);
          toast({ title: 'OTP Sent', description: 'An OTP has been sent to your phone.' });
        } else if (error) {
          handleAuthError(error, 'phone');
        }
        setIsOtpSending(false);
      });
    } else { // Step 2: Verify OTP
      if (!confirmationResult || !values.otp) {
        return toast({ variant: 'destructive', title: 'Error', description: 'Please enter the OTP.' });
      }
      setIsOtpVerifying(true);
      verifyOtp(confirmationResult, values.otp, (user, error) => {
        if (user) {
          handleAuthSuccess();
        } else if (error) {
          handleAuthError(error, 'phone');
        }
        setIsOtpVerifying(false);
      })
    }
  };


  const handleGoogleSignIn = () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    initiateGoogleSignIn(auth, (user, error) => {
      if (user) {
        handleAuthSuccess();
      } else if (error) {
        handleAuthError(error, 'google');
      }
    })
  }

  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8"/>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
       <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
      <Card className="w-full max-w-sm relative">
        <Link href="/" passHref>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4">
                <X className="h-5 w-5" />
            </Button>
        </Link>
        <CardHeader>
          <CardTitle>Log In</CardTitle>
          <CardDescription>Choose your preferred login method.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
                <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 mt-4">
                    <FormField
                        control={emailForm.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={emailForm.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || isOtpSending || isOtpVerifying}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Log In'}
                    </Button>
                    </form>
                </Form>
            </TabsContent>
            <TabsContent value="phone">
            <Form {...phoneForm}>
                    <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={phoneForm.control}
                            name="phone"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-10 items-center rounded-md border border-input bg-background px-3">
                                        <span className="text-sm text-muted-foreground">+91</span>
                                    </div>
                                    <Input placeholder="98765 43210" {...field} disabled={otpSent}/>
                                </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        {otpSent && (
                             <FormField
                                control={phoneForm.control}
                                name="otp"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enter OTP</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Enter the 6-digit code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
                        <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || isOtpSending || isOtpVerifying}>
                            {isOtpSending && <><Loader2 className="animate-spin mr-2"/> Sending OTP...</>}
                            {isOtpVerifying && <><Loader2 className="animate-spin mr-2"/> Verifying...</>}
                            {!isOtpSending && !isOtpVerifying && (otpSent ? 'Verify OTP & Log In' : 'Send OTP')}
                        </Button>

                         {otpSent && (
                            <Button variant="link" size="sm" className="w-full" onClick={() => {
                                setOtpSent(false);
                                setConfirmationResult(null);
                                phoneForm.reset();
                            }}>
                                Change phone number
                            </Button>
                        )}
                    </form>
                </Form>
            </TabsContent>
          </Tabs>


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

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
            Sign in with Google
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

    