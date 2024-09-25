import { Tooltip } from 'antd';

export const I = ({ text }: { text: string }) => {
  return (
    <>
      <Tooltip title={text} trigger="hover">
        <div className="italic text-gray-100 rounded-full bg-[var(--primary-shade-a)] h-4 w-4 mt-1 flex items-center justify-center">
          i
        </div>
      </Tooltip>
    </>
  );
};
