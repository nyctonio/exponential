'use client';
import React, { useEffect, useState } from 'react';
import Advertis from '@/components/tools/advertis';
import { H1 } from '@/components/inputs/heading';
import UserManual from '@/components/tools/user-manual';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <UserManual />;
};

export default App;
