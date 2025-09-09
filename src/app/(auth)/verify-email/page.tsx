'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { authClient } from '../../../lib/auth-client';

const formSchema = z.object({
  otp: z.string(),
});

// Separate component for the form that uses search params
function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    await authClient.emailOtp.verifyEmail(
      {
        email: email || '', // required
        otp: values.otp, // required
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          router.push('/dashboard');
        },
        onError: ctx => {
          setIsLoading(false);
          setError(ctx.error?.message);
        },
      }
    );
    toast(
      <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        <code className="text-white">{JSON.stringify(values, null, 2)}</code>
      </pre>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter the 6-digit code sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-sm font-medium text-center block">
                      Verification Code
                    </FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          className="gap-2"
                          disabled={isLoading}
                          {...field}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot
                              index={0}
                              className="w-12 h-12 text-lg"
                            />
                            <InputOTPSlot
                              index={1}
                              className="w-12 h-12 text-lg"
                            />
                            <InputOTPSlot
                              index={2}
                              className="w-12 h-12 text-lg"
                            />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot
                              index={3}
                              className="w-12 h-12 text-lg"
                            />
                            <InputOTPSlot
                              index={4}
                              className="w-12 h-12 text-lg"
                            />
                            <InputOTPSlot
                              index={5}
                              className="w-12 h-12 text-lg"
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-center">
                      Check your email for the verification code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Didn&apos;t receive the code?{' '}
            <button
              type="button"
              className="font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              onClick={() => {
                // You could add resend functionality here
                console.log('Resend code requested');
              }}
            >
              Resend code
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading component for Suspense fallback
function VerifyEmailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="h-6 bg-muted rounded animate-pulse mx-auto w-3/4"></div>
          <div className="h-4 bg-muted/60 rounded animate-pulse mx-auto w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded animate-pulse w-1/3 mx-auto"></div>
              <div className="flex justify-center gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-muted rounded animate-pulse"
                  ></div>
                ))}
              </div>
              <div className="h-3 bg-muted/60 rounded animate-pulse w-2/3 mx-auto"></div>
            </div>
            <div className="h-11 bg-muted rounded animate-pulse w-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function VerifyEmailOTPPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
