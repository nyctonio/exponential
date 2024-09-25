'use client';
import { Tabs } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { usePageStore } from '@/store/tabs';
import { useUserStore } from '@/store/user';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { CloseOutlined } from '@ant-design/icons';

const Index = () => {
  console.log('tabs');
  const {
    activePage,
    activePages,
    addActivePage,
    setCurrentPage,
    removeFromActivePages,
  } = usePageStore();

  const { menus } = useUserStore();
  let pathname = usePathname();
  const router = useRouter();
  let pages = activePages.map((page, i) => {
    return {
      label: page.name,
      key: page.url,
      url: page.url,
    };
  });
  // close tab functionality
  const closeTab = (url: string) => {
    let isProgress = activePages.find((page) => page.url == url)?.progress;
    if (isProgress) {
      let confirm = window.confirm(
        'You have some unsaved changes do you want to close this tab?'
      );
    }
    console.log('close tab', url, pathname, activePages);
    if (`${url}` == pathname && activePages.length > 1) {
      removeFromActivePages(url);
      if (activePages[0].url == url) {
        router.push(activePages[1].url);
      } else {
        router.push(activePages[0].url);
      }
    } else {
      removeFromActivePages(url);
    }
  };
  useEffect(() => {
    // setting tabs
    let isPathNameInActivePages = false;
    activePages.forEach((page) => {
      if (page.url == pathname) {
        isPathNameInActivePages = true;
      }
    });
    if (isPathNameInActivePages) {
      setCurrentPage(pathname);
    } else {
      if (pathname == '/') {
        setCurrentPage('/');
        addActivePage('/', 'Dashboard');
      } else {
        setCurrentPage(pathname);
        let tabName = '';
        menus.forEach((m) => {
          m.subMenus.forEach((sm) => {
            if (pathname.startsWith(`/${sm.subMenuUrl}`)) {
              tabName = sm.subMenuText;
            }
          });
        });
        console.log('tabName', tabName);
        if (tabName == '') {
          // handle unauthorized access
        } else {
          setCurrentPage(pathname);
          addActivePage(pathname, tabName);
        }
      }
    }
    // end setting tabs
  }, [pathname]);
  return (
    <>
      <Tabs
        className=""
        activeKey={activePage}
        style={{
          backgroundColor: '',
        }}
        onChange={(e) => {
          console.log('tab change', e);
          router.push(`${e}`);
        }}
        items={pages.map((_, i) => {
          return {
            label: (
              <div
                className={`font-light flex justify-between items-center space-x-2`}
              >
                <div>{_.label}</div>
                <svg
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(_.url);
                  }}
                  width="14"
                  height="14"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  // color="#000"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            ),
            key: _.key,
            className: '',
            children: <></>,
          };
        })}
      />
    </>
  );
};

export default Index;
