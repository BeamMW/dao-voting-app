import React from 'react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { truncate } from '@core/utils';

import { useSelector } from 'react-redux';
import Input from './Input';
import Rate from './Rate';

export const AMOUNT_MAX = 253999999.9999999;

interface AmountInputProps {
  value: string;
  error?: string;
  valid?: boolean;
  pallete?: 'purple' | 'blue';
  from?: 'deposit' | 'withdraw'
  onChange?: (value: string) => void; //TODO
}

const ContainerStyled = styled.div`
  display: flex;
  flex-direction: column;
`;

const containerStyle = css`
  flex-grow: 1;
`;

const REG_AMOUNT = /^(?!0\d)(\d+)(\.)?(\d{0,8})?$/;

const rateStyle = css`
  font-size: 12px;
  align-self: start;
  margin-left: 15px;
`;

const AmountInput: React.FC<AmountInputProps> = ({
  value, error, pallete = 'purple', onChange, from, valid,
}) => {
  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value: raw } = event.target;

    if ((raw !== '' && !REG_AMOUNT.test(raw)) || parseFloat(raw) > AMOUNT_MAX) {
      return;
    }

    onChange(raw);
  };

  return (
    <ContainerStyled>
      <Input
        variant="proposal"
        from={from}
        valid={valid}
        label={error}
        value={value}
        pallete={pallete}
        maxLength={16}
        placeholder="0"
        className={containerStyle}
        onInput={handleInput}
        is_beamx={true}
      />
      {!error && <Rate value={parseFloat(value)} className={rateStyle} />}
    </ContainerStyled>
  );
};

export default AmountInput;
