'use client';
import Statement from '@/components/reports/account-statement';
import { useEffect } from 'react';

const Page = () => {
  console.log('rendering acc');
  useEffect(() => {
    console.log('use effect acc');
  }, []);
  return <Statement />;
};

export default Page;
