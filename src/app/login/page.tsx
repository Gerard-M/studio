'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error: any) {
      // This specific error code means the user intentionally closed the popup.
      // We don't need to show an error message for that.
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Login cancelled by user.');
        return;
      }
      
      // For any other error, log it and show a toast notification.
      console.error('Login failed:', error);
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred during login. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl border-2 border-primary/20">
        <CardHeader className="text-center p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-foreground">
            Docutrack
          </CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            Sign in to manage your documents
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-4">
          <Button onClick={handleLogin} className="w-full font-bold" size="lg">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.3 64.5C308.6 102.3 282.6 92 248 92c-73.4 0-134.3 57.5-134.3 128s60.9 128 134.3 128c79.9 0 119.3-57.9 123.8-91.8H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
