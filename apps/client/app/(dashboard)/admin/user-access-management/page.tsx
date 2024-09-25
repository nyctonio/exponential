'use client';
import React, { useEffect, useState } from 'react';
import UserAccess from '@/components/admin/user-access-management';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <>loading</>;
  }
  return <UserAccess />;
};

export default App;
