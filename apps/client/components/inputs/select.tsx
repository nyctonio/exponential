import { Select } from 'antd';
import styled from 'styled-components';

export const SelectStyled = styled.select.attrs((props) => ({
  className:
    ' rounded-[4px] h-[34px] text-[#8F95B2] !bg-[#ffffff] px-3 leading-8   border-[1.2px] !border-[#D8DAE5] !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)]',
}))``;

type SelectMenuAntd = {
  handleChange: (
    value: string,
    options:
      | { value: string; label: string; disabled?: any }
      | { value: string; label: string; disabled?: any }[]
  ) => void;
  defaultValue?: string;
  value: string;
  options: {
    value: string;
    label: string;
    disabled?: any;
  }[];
  className?: string;
  loading?: boolean;
};

export function SelectAntd({
  handleChange,
  value,
  defaultValue,
  options,
  className = '',
  loading = false,
}: SelectMenuAntd) {
  return (
    <Select
      loading={loading}
      defaultValue={defaultValue}
      className={
        className +
        ` normal-select bg-[var(--light)] rounded-[4px] leading-8 !w-full  !border-[var(--light)] !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)]`
      }
      bordered={false}
      onChange={(value, option) => {
        handleChange(value, option);
      }}
      options={options}
    />
  );
}
export function SelectAntdBorder({
  handleChange,
  value,
  defaultValue,
  options,
  disabled = false,
  className = '',
  placeholder,
}: SelectMenuAntd & {
  disabled?: boolean;
  defaultValue?: any;
  placeholder?: any;
}) {
  return (
    <Select
      size="middle"
      defaultValue={defaultValue}
      className={
        className +
        ' rounded-[4px] leading-8 !w-full border-[1.2px] !border-[#D8DAE5] !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)]'
      }
      disabled={disabled}
      bordered={false}
      style={{ borderColor: '#D8DAE5', boxShadow: 'none' }}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
    />
  );
}
