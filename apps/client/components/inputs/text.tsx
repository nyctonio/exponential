import styled from 'styled-components';
import React from 'react';

export const TextInput = styled.input.attrs({
  type: 'text',
  className:
    'py-2 rounded-md pl-2 md:pl-4 outline-none focus:ring-2 focus:ring-[var(--primary-shade-c)] focus:ring-opacity-50',
})``;

export const LoginInput = styled.input.attrs({
  className:
    'rounded-[4px] placeholder:text-[#8F95B2] placeholder:font-[300] text-xs py-2 pl-2 md:pl-4 border-[1.2px] border-[#D8DAE5] outline-none  focus:border-[var(--primary-shade-c)] ',
})``;

export const BorderInput = styled.input.attrs({
  className:
    'rounded-[4px] leading-8 placeholder:align-middle placeholder:text-[#8F95B2] placeholder:font-[300] placeholder:text-[12px] pl-2 md:pl-4 border-[1.2px]  border-[#D8DAE5] outline-none  focus:border-[var(--primary-shade-c)] disabled:text-[#8F95B2]',
})``;

export const LabeledWrapper = ({
  label,
  children,
  required = false,
  className = '',
  error = '',
}: {
  label: string;
  children: React.JSX.Element;
  required?: boolean;
  className?: string;
  error?: string;
}) => {
  let space = '   ';
  return (
    <div
      className={`${
        label == '' ? '' : 'space-y-1'
      } flex w-full flex-col ${className}`}
    >
      <label
        htmlFor=""
        className={`${label == '' ? '' : ''}text-[#696F8C] text-xs font-[400]`}
      >
        {label}
        {required && <span className="text-[#D14343] ml-[2px]">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-[#D14343] text-xs font-[400]">{error}</span>
      )}
    </div>
  );
};

export const LabeledTextbox = ({
  label,
  rows,
  cols,
  required = false,
  resize = false,
  className = '',
  onChange,
  value,
}: {
  label: string;
  rows: number;
  cols: number;
  required?: boolean;
  resize?: boolean;
  className?: string;
  onChange?: (e: any) => void;
  value: string;
}) => {
  return (
    <div
      className={`${
        label == '' ? '' : 'space-y-1'
      } flex w-full flex-col ${className} `}
    >
      <label
        htmlFor=""
        className={`${label == '' ? '' : ''} text-[#696F8C] text-xs font-[400]`}
      >
        {label}
        {required && <span className="text-[#D14343] ml-[2px]">*</span>}
      </label>
      <textarea
        cols={cols}
        rows={rows}
        value={value}
        className={`${
          !resize && 'resize-none'
        } rounded-[4px] leading-8 placeholder:align-middle placeholder:text-[#8F95B2] placeholder:font-[300] placeholder:text-[12px] pl-2 md:pl-4 border-[1.2px]  border-[#D8DAE5] outline-none  focus:border-[var(--primary-shade-c)] disabled:text-[#8F95B2]`}
        onChange={onChange}
      ></textarea>
    </div>
  );
};
