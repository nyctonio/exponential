import { useRouter } from 'next/navigation';
// import { useUserStore } from '@/store/user';
// import { usePageStore } from '@/store/tabs';
import printSafe from '@/utils/common/print';

const useRedirectOnLogin = () => {
  const router = useRouter();
  // const { user } = useUserStore();
  // const { addActivePage, setCurrentPage } = usePageStore();
  const userIdUrlMapper: {
    [key: string]: string;
  } = {
    Master: 'admin/search-client',
    Broker: 'admin/search-client',
    Client: 'trade/perform-trades',
    'Sub-Broker': 'admin/search-client',
    Company: 'admin/search-client',
  };

  const redirectOnLogin = (userType: string, menus: any) => {
    if (userType) {
      let routeName = '';
      const userMenus = menus || [];
      for (let menu of userMenus) {
        for (let subMenu of menu.subMenus) {
          if (subMenu.subMenuUrl == userIdUrlMapper[userType]) {
            routeName = subMenu.subMenuText;
            break;
          }
        }
      }
      printSafe([userType, routeName]);
      if (routeName != '') {
        // setCurrentPage(`/${userIdUrlMapper[userType]}`);
        // addActivePage(`${userIdUrlMapper[userType]}`, routeName);
        router.push(`/${userIdUrlMapper[userType]}`);
      }
    }
  };

  return { redirectOnLogin };
};

export default useRedirectOnLogin;
