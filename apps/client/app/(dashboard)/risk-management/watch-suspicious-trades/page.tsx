'use client';
import React, { useEffect, useState } from 'react';
import WatchSuspicious from '@/components/risk-management/watch-suspicious-trades';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <WatchSuspicious />;
};

export default App;
