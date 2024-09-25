import styled from 'styled-components';

export const H1 = styled.h1.attrs({
  className: 'text-[var(--dark)] font-bold text-2xl',
})``;

export const H4 = styled.h4.attrs({
  className: 'text-[var(--dark)] font-normal text-[15px]',
})``;

export const NormalText = styled.p.attrs({
  className: 'text-[var(--dark)] font-normal text-base',
})``;

export const BoldText = styled.p.attrs({
  className: 'text-[var(--dark)] font-bold text-base',
})``;

export const MediumText = styled.p.attrs({
  className: 'text-[var(--dark)] text-xs font-[400]',
})``;
