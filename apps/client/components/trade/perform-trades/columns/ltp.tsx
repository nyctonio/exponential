import Image from 'next/image';
const Index = ({ ltp, ltp_status }: { ltp: string; ltp_status: string }) => {
  return (
    <>
      <div className="flex justify-between min-w-[60px] items-center space-x-1">
        <p
          className={
            ltp_status == 'INCREASE' ? ' text-[#429775]' : '  text-[#D14343]'
          }
        >
          {ltp}
        </p>
        <div className="py-1">
          <Image
            src={
              ltp_status == 'INCREASE'
                ? '/assets/icons/triangle_green.svg'
                : '/assets/icons/triangle_red.svg'
            }
            className={ltp_status == 'DECREASE' ? 'rotate-180 z-0' : 'z-0'}
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
