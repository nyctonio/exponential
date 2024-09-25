'use client';
import React, { useEffect, useState } from 'react';
import Advertis from '@/components/tools/advertis';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <Advertis />;
};

export default App;
