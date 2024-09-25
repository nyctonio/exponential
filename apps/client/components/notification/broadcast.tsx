import useFetch from '@/hooks/useFetch';
import { useBroadCastMessages } from '@/store/notification/broadcast';
import { AdminBroadCastMessageType } from '@/store/tools/adminmessage';
import Routes from '@/utils/routes';
import { useEffect } from 'react';

const BroadCastListComponent = () => {
  const { apiCall } = useFetch();
  const { refreshCount, setMessages } = useBroadCastMessages();
  const dataFetcher = async () => {
    let res = await apiCall(Routes.NOTIFICATION.GET_MESSAGE_LIST, {});
    if (res.status) {
      const modifiedMessages = res.data.map(
        (item: AdminBroadCastMessageType) => ({
          ...item,
          content: item.message,
        })
      );
      setMessages(modifiedMessages);
    } else {
      return;
    }
  };
  useEffect(() => {
    dataFetcher();
  }, [refreshCount]);
  return <></>;
};

export default BroadCastListComponent;
