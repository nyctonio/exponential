'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { usePageStore } from '@/store/pages';
import { useState, useEffect } from 'react';
import printSafe from '../common/print';
import TopBarProgress from 'react-topbar-progress-indicator';

TopBarProgress.config({
  barColors: {
    '0': '#f59202',
    '1.0': '#f59202',
  },
  shadowBlur: 5,
});

// disabled means the link is not clickable and not visible
export default function CustomLink({
  url,
  text,
  classes = '',
  disabled = false,
  children,
}: {
  url: string;
  text: string;
  classes?: string;
  disabled?: boolean;
  children?: JSX.Element;
}) {
  const router = useRouter();
  const { user } = useUserStore();
  const pathname = usePathname();
  const [progressBar, setProgressBar] = useState(false);
  const { setActivePage } = usePageStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);
  useEffect(() => {
    setProgressBar(false);
  }, [pathname]);

  if (!hydrated) return <></>;
  // const handleLink = () => {
  //   if (disabled) return;
  //   printSafe([`/${url}`, pathname]);
  //   if (`/${url}` != pathname) {
  //     setProgressBar(true);
  //   }
  //   // remove the query params from the
  //   let oldUrl = url;
  //   url = url.split('?')[0];
  //   // find the url text from user menus or submenus
  //   const menu = user?.menus.find((menu) => menu.menuUrl == url);
  //   const subMenu = user?.menus
  //     .map((menu) => menu.subMenus)
  //     .flat()
  //     .find((subMenu) => subMenu.subMenuUrl == url);
  //   printSafe(['subMenuText', subMenu]);
  //   const menuText = menu?.menuText || subMenu?.subMenuText;
  //   printSafe(['menuText', menuText]);
  //   if (!menuText) return;
  //   setActivePage(url, menuText);
  //   router.push(oldUrl);
  // };

  return (
    <button
      className={`${
        disabled ? '' : 'hover:cursor-pointer'
      }  w-full text-left ${classes}`}
      // onClick={handleLink}
    >
      {progressBar && <TopBarProgress />}
      {children ? children : <>{text}</>}
    </button>
  );
}
