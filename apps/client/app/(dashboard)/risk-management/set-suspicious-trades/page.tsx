'use client';
import SetSuspicious from '@/components/risk-management/set-suspicious-trades';
import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <SetSuspicious />;
};

export default App;
