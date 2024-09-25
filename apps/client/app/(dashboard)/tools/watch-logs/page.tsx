'use client';
import React, { useEffect, useState } from 'react';
import WatchLogs from '@/components/tools/watch-logs';
const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <WatchLogs />;
};

export default App;
