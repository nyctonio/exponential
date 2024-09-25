'use client';
import React, { useEffect, useState } from 'react';
import Broadcast from '@/components/tools/broadcast-message';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <Broadcast />;
};

export default App;
