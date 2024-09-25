'use client';
import React, { useEffect, useState } from 'react';
import UserAccess from '@/components/tools/default-function';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <>loading</>;
  }
  return <UserAccess />;
};

export default App;
