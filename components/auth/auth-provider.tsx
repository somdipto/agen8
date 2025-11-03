'use client';

import { ReactNode, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isPending) {
        console.warn('Session check timed out, redirecting to login');
        router.push('/login');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isPending, router]);

  useEffect(() => {
    if (!isPending && !session && pathname !== '/login') {
      router.push('/login');
    }
  }, [session, isPending, router, pathname]);

  // Show error if session check failed
  if (error) {
    console.error('Auth error:', error);
    if (pathname !== '/login') {
      router.push('/login');
    }
    return null;
  }

  // Still loading
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
          <div className="text-muted-foreground text-sm">Please wait</div>
        </div>
      </div>
    );
  }

  // Not logged in, show nothing (will redirect)
  if (!session) {
    return null;
  }

  // Logged in, show content
  return <>{children}</>;
}
