'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import { useState } from 'react';
import { useUserStore } from '@/store/user';
import { usePageStore } from '@/store/tabs';
import Image from 'next/image';

const Icon = ({ url }: { url: string }) => {
  return (
    <div className="flex justify-center items-center w-8">
      <Image src={url} height={100} width={100} alt="logo" />
    </div>
  );
};

const Page = ({
  mode,
}: {
  mode: 'horizontal' | 'vertical' | 'inline' | undefined;
}) => {
  const { menus } = useUserStore();
  const { activePage } = usePageStore();
  const router = useRouter();
  let rootMenuKeys = menus.map((item) => {
    return item.menuConstantText;
  });

  const [openKeys, setOpenKeys] = useState(['']);

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    console.log('onOpenChange', keys, openKeys);
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootMenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };
  const [collapsed, setCollapsed] = React.useState(false);
  type MenuItem = Required<MenuProps>['items'][number];

  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[]
  ): MenuItem {
    return {
      key,
      icon,
      style: { border: '0px 2px 2px 0px solid black' },
      children,
      label,
      title: collapsed ? '' : label,
      onClick: () => {
        let _key = key as string;
        // if key in rootMenuKeys then do nothing
        if (rootMenuKeys.indexOf(_key) === -1) {
          router.push(`/${_key}`);
        }
      },
    } as MenuItem;
  }
  const items: MenuItem[] = menus.map((item) => {
    return getItem(
      item.menuText,
      item.menuConstantText,
      <Icon url={`/sider/${item.menuConstantText}.svg`} />,
      item.subMenus.map((subItem) => {
        return getItem(subItem.subMenuText, subItem.subMenuUrl);
      })
    );
  });

  return (
    <Menu
      mode={mode}
      className={`_ant-sider`}
      selectedKeys={[activePage == '/' ? activePage : activePage.slice(1)]}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      style={{ borderRight: 0, color: 'white' }}
      items={items}
    />
  );
};

export default Page;
