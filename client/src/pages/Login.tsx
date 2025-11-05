import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { loginUserSchema, type LoginUser } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginUser) => {
    setIsLoading(true);
    try {
      const res = await apiRequest('POST', '/api/auth/login', data);
      const response = await res.json() as { message: string; user: any };

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });

      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Navigate to home page
      navigate('/');
    } catch (error: any) {
      // Check if it's an email verification error
      if (error.message?.includes('verify your email')) {
        toast({
          variant: 'destructive',
          title: 'Email not verified',
          description: 'Please verify your email before logging in.',
        });
        navigate('/verify-email?email=' + encodeURIComponent(data.email));
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: error.message || 'Invalid email or password',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">Welcome Back</h1>
          <p className="text-muted-foreground text-lg">
            Sign in to continue to CUR8tr
          </p>
        </div>

        <div className="border-4 border-foreground p-6 md:p-8 bg-card">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium uppercase tracking-wide">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your@email.com"
                        disabled={isLoading}
                        className="border-2"
                        data-testid="input-email"
                      />
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
                    <FormLabel className="text-sm font-medium uppercase tracking-wide">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="border-2"
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full border-4 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-medium hover:underline"
                data-testid="link-register"
              >
                Create one
              </button>
            </p>
            <p className="text-sm text-muted-foreground">
              Need to verify your email?{' '}
              <button
                onClick={() => navigate('/verify-email')}
                className="font-medium hover:underline"
                data-testid="link-verify"
              >
                Enter code
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
