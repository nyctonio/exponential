'use client';
import Menu from '@/components/layout/menu';
import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';
const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const route = usePathname();
  const router = useRouter();
  const { menus } = useUserStore();
  useEffect(() => {
    // const isAuthenticated = menus.filter((menu) => {
    //   return menu.subMenus.find((subMenu) => {
    //     return subMenu.subMenuUrl === route.slice(1, route.length);
    //   });
    // });
    // if (isAuthenticated.length === 0) {
    //   router.push('/');
    // }
  }, []);
  return (
    <>
      <Sider
        theme="light"
        collapsible
        breakpoint="md"
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={250}
        className="hidden md:block pt-4 _ant-sider"
        collapsedWidth={60}
      >
        <div className="flex flex-col border-b-[.7px] pb-[11px] border-gray-200 mb-10 justify-center items-center space-x-3">
          <div className=" text-[var(--light)] text-xl font-bold -mt-1 rounded-full flex justify-center items-center w-8 h-8">
            {collapsed ? 'eX' : 'eXpo'}
          </div>
        </div>
        <Menu mode="inline" />
      </Sider>
    </>
  );
};

export default Sidebar;
