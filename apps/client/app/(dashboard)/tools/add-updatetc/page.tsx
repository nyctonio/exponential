'use client';
import React, { useEffect, useState } from 'react';
import Advertis from '@/components/tools/advertis';
import { H1 } from '@/components/inputs/heading';
import AddUpdatetc from '@/components/tools/add-updatetc';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <AddUpdatetc />;
};

export default App;
