'use client';
import Settelments from '@/components/reports/settelments';
import { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <Settelments />;
};

export default App;
