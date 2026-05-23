'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/shared/NavBar';
import { hasLearnerSession } from '@/lib/auth';

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!hasLearnerSession()) {
      router.replace('/access');
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-display text-[11px] uppercase tracking-[0.14em] text-neon-green">
          [ok] verifying clearance...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      {children}
    </div>
  );
}
