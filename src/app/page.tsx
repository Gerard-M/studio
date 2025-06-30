'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Dashboard from '@/components/dashboard';
import Header from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col h-svh">
        <header className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </header>
        <main className="flex-1 p-6 space-y-8 overflow-auto">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full flex-col">
      <Header user={user} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Dashboard user={user} />
      </main>
    </div>
  );
}
