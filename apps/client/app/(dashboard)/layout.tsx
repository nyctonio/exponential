import { Layout } from 'antd';
import Providers from './provider';
import Sider from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import Tabs from '@/components/layout/tabs';
import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Menu from '@/components/layout/menu';
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Exponential',
  description: 'Trading Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Layout
            className="h-[calc(100dvh)]"
            style={{
              backgroundColor: 'black',
            }}
          >
            <Sider />
            <Layout
              style={{
                backgroundColor: 'var(--light-bg)',
              }}
              className="h-[calc(100dvh)] flex justify-between overflow-hidden"
            >
              {/* responsive */}
              <div className="h-[90%] md:h-[100%] overflow-hidden">
                <Header />
                <Tabs />
                <div className="h-[75dvh] md:h-[85dvh] !px-0 overflow-y-scroll">
                  <NextTopLoader color="#fff" height={3} />
                  {children}
                </div>
              </div>
              <div className="block z-10 md:hidden">
                <Menu mode="horizontal" />
              </div>
            </Layout>
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
