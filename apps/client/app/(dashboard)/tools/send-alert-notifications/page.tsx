'use client';
import React, { useEffect, useState } from 'react';
import SendNotification from '@/components/tools/send-alert-notifications';

const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return <>loading</>;
  }
  return <SendNotification />;
};

export default App;
