const Index = ({
  sell_price,
  sell_price_status,
  border = false,
}: {
  sell_price: string;
  sell_price_status: string;
  border?: boolean;
}) => {
  return (
    <div className={`text-white w-full`}>
      <div className="flex justify-center w-full items-center">
        <div
          className={`text-[var(--light)] ${
            border
              ? sell_price_status === 'INCREASE'
                ? '!text-[#429775]'
                : '!text-[#D14343]'
              : sell_price_status === 'INCREASE'
                ? 'bg-[#429775]  border-[#429775]'
                : 'bg-[#D14343] border-[#D14343]'
          } w-full shadow-2xl ${
            border ? '' : 'px-2 py-[2px] border-[1.5px] rounded-md'
          }`}
        >
          {sell_price}
        </div>
      </div>
    </div>
  );
};

export default Index;

<div></div>;
