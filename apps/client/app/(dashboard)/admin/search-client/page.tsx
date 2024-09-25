'use client';
import React, { useEffect, useState } from 'react';
import SearchUser from '@/components/admin/search-user';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <>loading</>;
  }
  return <SearchUser />;
};

export default App;
