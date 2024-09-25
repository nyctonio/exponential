'use client';
import { useEffect } from 'react';

const Page = () => {
  console.log('rendering rep');
  useEffect(() => {
    console.log('use effect rep');
  }, []);
  return <div>Report</div>;
};

export default Page;
