import Image from 'next/image';

const Index = ({
  symbol,
  ltp,
  close,
}: {
  symbol: string;
  ltp: string;
  close: string;
}) => {
  return (
    <div className="px-2 py-1 text-center">
      <div className="flex justify-between min-w-[70px] items-center space-x-1">
        <div>{symbol}</div>
        <Image
          src={
            ltp >= close
              ? '/assets/icons/triangle_green.svg'
              : '/assets/icons/triangle_red.svg'
          }
          className={ltp < close ? 'rotate-180 z-0' : 'z-0'}
          width={10}
          height={10}
          alt="sign"
        />
      </div>
    </div>
  );
};

export default Index;
