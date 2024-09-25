'use client';
import React, { useEffect, useState } from 'react';
import Reconciliation from '@/components/tools/reconciliation';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <Reconciliation />;
};

export default App;
