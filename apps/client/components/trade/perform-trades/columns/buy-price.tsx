import { useState, useEffect } from 'react';

const Index = ({
  buy_price,
  buy_price_status,
  border = false,
}: {
  buy_price: string;
  buy_price_status: string;
  border?: boolean;
}) => {
  return (
    <div className={`w-full`}>
      <div className="flex justify-center w-full items-center">
        <div
          className={`text-[var(--light)] ${
            border
              ? buy_price_status === 'INCREASE'
                ? '!text-[#429775]'
                : '!text-[#D14343]'
              : buy_price_status === 'INCREASE'
                ? 'bg-[#429775]  border-[#429775]'
                : 'bg-[#D14343] border-[#D14343]'
          } w-full shadow-2xl ${
            border ? '' : 'px-2 py-[2px] border-[1.5px] rounded-md'
          }`}
        >
          {buy_price}
        </div>
      </div>
    </div>
  );
};

export default Index;
