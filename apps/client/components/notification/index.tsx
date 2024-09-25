'use client';

import useFetch from '@/hooks/useFetch';
import { useNotifications } from '@/store/notification/notification';
import Routes from '@/utils/routes';
import { useEffect } from 'react';

const NotificationsComponent = (props: any) => {
  const { apiCall } = useFetch();
  const {
    loading,
    refreshCount,
    notifications,
    setLoading,
    setRefreshCount,
    setNotifications,
  } = useNotifications();

  const dataFetcher = async () => {
    setLoading(false);
    let res = await apiCall(Routes.NOTIFICATION.GET_NOTIFICATIONS, {}, false);
    if (res.status) {
      setNotifications(res.data);
    } else {
      return;
    }
  };
  useEffect(() => {
    dataFetcher();
  }, [refreshCount]);
  return <></>;
};

export default NotificationsComponent;
