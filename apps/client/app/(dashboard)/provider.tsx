'use client';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Loading from '@/components/layout/loading';
import { usePageStore } from '@/store/tabs';
import { usePathname } from 'next/navigation';

export interface ContextProps {
  children: React.ReactNode;
}

const MainProvider = ({ children }: ContextProps) => {
  return <>{children}</>;
};

export default function AuthContext({ children }: ContextProps) {
  const [loading, setLoading] = useState(true);
  const { user } = useUserStore();
  const router = useRouter();
  useEffect(() => {
    setLoading(false);
  }, []);
  if (loading) {
    return <Loading />;
  }
  if (user == null) {
    // add additional auth checks here
    router.push('/login');
    return <>Unauthenticated</>;
  }
  return (
    <MainProvider>
      <Toaster toastOptions={{}} containerClassName="toaster-wrapper" />
      {children}
    </MainProvider>
  );
}
