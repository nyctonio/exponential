import Image from 'next/image';
const Index = ({
  buy_qty,
  buy_qty_status,
}: {
  buy_qty: string;
  buy_qty_status: string;
}) => {
  return (
    <>
      <div className="flex justify-between min-w-[40px] items-center space-x-1">
        <p
          className={
            buy_qty_status == 'INCREASE' ? 'text-[#429775]' : '  text-[#D14343]'
          }
        >
          {buy_qty}
        </p>
        <div className="py-1">
          <Image
            src={
              buy_qty_status == 'INCREASE'
                ? '/assets/icons/triangle_green.svg'
                : '/assets/icons/triangle_red.svg'
            }
            className={buy_qty_status == 'DECREASE' ? 'rotate-180 z-0' : 'z-0'}
            width={10}
            height={10}
            alt="sign"
          />
        </div>
      </div>
    </>
  );
};

export default Index;
