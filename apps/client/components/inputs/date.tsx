import { DatePicker } from 'antd';
import moment from 'moment';

export function DatePickerAntd({
  onChange,
  defaultValue,
  value,
  className = '',
  pastDateAllowed = false,
}: {
  onChange: (value: any, dateString: any) => void;
  defaultValue: any;
  value?: any;
  className?: string;
  pastDateAllowed?: boolean;
}) {
  const disabledDate = (current: any) => {
    // Disable all dates before today
    return current && current < moment().startOf('day');
  };
  return (
    <DatePicker
      defaultValue={defaultValue}
      className={`${className}
      'placeholder:text-sm !rounded-[4px] leading-8 !w-full border-[1.2px] !border-[#D8DAE5] !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)]'
      `}
      value={value}
      onChange={onChange}
      disabledDate={pastDateAllowed == false ? disabledDate : () => {}} // Add the disabledDate prop to disable all dates before today
    />
  );
}
