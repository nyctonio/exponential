'use client';
import { useEffect, useState } from 'react';
import ManualReconciliations from '@/components/trade/manual-reconcilations';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <ManualReconciliations />;
};

export default App;
