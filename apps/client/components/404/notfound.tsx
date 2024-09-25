import React from 'react';

import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

function PageNotFound() {
  return (
    <div className="flex flex-col items-center h-screen space-y-8 justify-center md:flex-row md:space-y-0 md:justify-around ">
      <img
        src="https://user-images.githubusercontent.com/43953425/166269493-acd08ccb-4df3-4474-95c7-ad1034d3c070.svg"
        alt=""
        className="h-80 px-10 md:hidden"
      />
      <div
        className={`${inter.className}  flex justify-center items-center md:items-start flex-col md:space-y-2 `}
      >
        <h1 className="font-bold text-3xl md:text-5xl">404</h1>
        <h2 className="text-sm font-light">Page Not Found</h2>
        <Link
          className="text-md text-[var(--primary-shade-a)] leading-10 underline"
          href="/"
        >
          return to homepage
        </Link>
      </div>
      <img
        src="https://user-images.githubusercontent.com/43953425/166269493-acd08ccb-4df3-4474-95c7-ad1034d3c070.svg"
        alt=""
        className="h-96 hidden md:block"
      />
    </div>
  );
}

export default PageNotFound;
