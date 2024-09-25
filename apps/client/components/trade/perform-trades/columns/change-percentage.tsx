import Image from 'next/image';
const Index = ({
  change,
  minWidth = true,
}: {
  change: string;
  minWidth?: boolean;
}) => {
  return (
    <>
      <div
        className={`flex justify-between ${
          minWidth ? 'min-w-[70px]' : ''
        }  items-center space-x-1`}
      >
        <span
          className={
            parseFloat(change) < 0 ? 'text-[#D14343]' : 'text-[#429775]'
          }
        >
          {change}%
        </span>
        <div className="py-1">
          <Image
            src={
              parseFloat(change) < 0
                ? '/assets/icons/triangle_red.svg'
                : '/assets/icons/triangle_green.svg'
            }
            className={parseFloat(change) < 0 ? 'rotate-180 z-0' : 'z-0'}
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
