import { Button } from 'antd';
import { MouseEventHandler } from 'react';
import styled from 'styled-components';

export const PrimaryButton = styled.button.attrs({
  className:
    'bg-[var(--primary-shade-b)] border-[1.5px] hover:border-[var(--primary-shade-a)] border-[var(--primary-shade-b)] min-w-[110px] hover:bg-[var(--primary-shade-a)] text-[var(--light)] px-4 py-2 rounded-md',
})``;

export const BorderedButton = styled.button.attrs({
  className:
    'border-[1.5px] min-w-[110px] border-[#D8DAE5] hover:border-[var(--primary-shade-a)] px-4 py-2 rounded-md',
})``;

type asyncButtonProps = {
  loading: boolean;
  isCancel: boolean;
  title: string;
  type: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler;
  className?: string;
};
export const AsyncButtonAntd = ({
  loading,
  isCancel,
  title,
  type,
  onClick,
  className,
}: asyncButtonProps) => {
  return (
    <Button
      loading={loading}
      disabled={loading}
      onClick={onClick ? onClick : () => {}}
      size="middle"
      className={`${className} !px-4 `}
      style={{
        backgroundColor: isCancel == true ? 'white' : 'var(--primary-shade-b)',
        color: isCancel == false ? 'white' : 'var(--primary-shade-b)',
        borderColor: 'var(--primary-shade-b)',
        borderRadius: '3px',
      }}
      htmlType={type}
    >
      {title}
    </Button>
  );
};
