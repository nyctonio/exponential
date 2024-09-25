'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Reset from '@/components/auth/reset';
import { Suspense } from 'react';

const ResetPage = () => {
  const params = useSearchParams();
  const token = params?.get('token');
  const username = params?.get('username');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    setLoading(false);
  }, []);
  if (loading) {
    return <>Loading...</>;
  }
  if (!loading && (!token || !username)) {
    router.push('/login');
  }
  return <Reset username={username || ''} token={token || ''} />;
};

function Page() {
  return (
    <Suspense>
      <ResetPage />
    </Suspense>
  );
}

export default Page;
