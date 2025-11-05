import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { verifyEmailSchema, resendCodeSchema, type VerifyEmail, type ResendCode } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from URL params
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      form.setValue('email', emailParam);
    }
  }, [location]);

  const form = useForm<VerifyEmail>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: '',
      code: '',
    },
  });

  const onSubmit = async (data: VerifyEmail) => {
    setIsLoading(true);
    try {
      const res = await apiRequest('POST', '/api/auth/verify-email', data);
      const response = await res.json() as { message: string };

      toast({
        title: 'Email verified!',
        description: response.message,
      });

      // Navigate to login
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification failed',
        description: error.message || 'Invalid verification code',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    const emailValue = form.getValues('email');
    if (!emailValue) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter your email address',
      });
      return;
    }

    setIsResending(true);
    try {
      const res = await apiRequest('POST', '/api/auth/resend-code', { email: emailValue } as ResendCode);
      const response = await res.json() as { message: string };

      toast({
        title: 'Code resent!',
        description: 'Check your email for a new verification code.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to resend code',
        description: error.message || 'Please try again later',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-foreground rounded-full mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">Verify Your Email</h1>
          <p className="text-muted-foreground text-lg">
            We sent a 6-digit code to your email
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium uppercase tracking-wide">
                      Verification Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        disabled={isLoading}
                        className="border-2 text-2xl text-center tracking-widest font-mono"
                        data-testid="input-code"
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
                data-testid="button-verify"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center space-y-3">
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending}
              className="border-2"
              data-testid="button-resend"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Resending...' : 'Resend Code'}
            </Button>

            <p className="text-sm text-muted-foreground">
              Already verified?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium hover:underline"
                data-testid="link-login"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Code expires in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
