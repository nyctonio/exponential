import { useMarketIndex } from '@/store/script/market-index';
import { useEffect } from 'react';

const Niftybar = () => {
  const { indexes } = useMarketIndex();

  // useEffect(() => {
  //   let _i = setInterval(() => {
  //     dataFetcher();
  //   }, 1000);
  //   return () => {
  //     clearInterval(_i);
  //   };
  // }, []);
  // useEffect(() => {}, [indexes]);

  return (
    <div
      id="nifty-bar"
      className="w-full h-full space-x-1 overflow-x-scroll flex items-center text-white"
    >
      {indexes.map((item, index) => {
        return (
          <div
            key={index}
            className={
              item.status && item.status == 'INCREASE'
                ? 'bg-[#429775] flex justify-around text-center min-w-[250px] sm:w-1/4 py-[4px]'
                : 'bg-[#D14343] flex justify-around text-center min-w-[250px] sm:w-1/4 py-[4px]'
            }
          >
            <div>{item.name}</div>
            <div>{item.value || '-'}</div>
            <div>
              {/* {item.change || '-'} */}(
              {item.perChange && `${item.perChange}%`})
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Niftybar;
