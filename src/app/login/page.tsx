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
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!auth) return;
    setIsLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if(user){
          toast({ title: 'Login Successful', description: `Welcome back!` });
          router.push('/');
        }
        setIsLoading(false);
        unsubscribe(); // Clean up listener
      },
      (error) => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message || 'An unexpected error occurred.',
        });
        unsubscribe(); // Clean up listener
      }
    );

    initiateEmailSignIn(auth, values.email, values.password, (error) => {
      // This callback handles sign-in specific errors
      if (error) {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Please check your email and password.',
        });
      }
    });
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8"/>
      </div>
    );
  }


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Log In</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Log In'}
              </Button>
            </form>
          </Form>
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
