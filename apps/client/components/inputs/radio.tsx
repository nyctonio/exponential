import { Radio, RadioChangeEvent } from 'antd';

export function SwitchSelect({
  onChange,
  disabled = false,
  value,
  className = '',
}: {
  onChange: (e: RadioChangeEvent) => void;
  disabled?: boolean;
  value: string;
  className?: string;
}) {
  return (
    <div className={'space-x-2 text-[#696F8C] text-xs font-[400]'}>
      <Radio.Group
        onChange={onChange}
        value={value}
        disabled={disabled}
        className={`flex border-none`}
      >
        <Radio.Button
          value="crore"
          className="text-xs h-7 flex justify-center items-center"
          style={{
            backgroundColor:
              disabled && value == 'crore'
                ? 'grey'
                : value == 'crore'
                  ? 'var(--primary-shade-b)'
                  : 'white',
            color: value == 'crore' ? 'white' : 'black',
            border: disabled
              ? '1px solid grey'
              : ' 1px solid var(--primary-shade-b)',
          }}
        >
          Cr
        </Radio.Button>
        <Radio.Button
          value="lot"
          checked={false}
          className="text-xs h-7 flex justify-center items-center "
          style={{
            backgroundColor:
              disabled && value == 'lot'
                ? 'grey'
                : value == 'lot'
                  ? 'var(--primary-shade-b)'
                  : 'white',
            color: value == 'lot' ? 'white' : 'black',
            border: disabled
              ? '1px solid grey'
              : ' 1px solid var(--primary-shade-b)',
          }}
        >
          Lot
        </Radio.Button>
      </Radio.Group>
    </div>
  );
}
