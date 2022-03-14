import React from 'react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { truncate } from '@core/utils';

import { useSelector } from 'react-redux';
import Input from './Input';
import Rate from './Rate';

export const AMOUNT_MAX = 253999999.9999999;

const ContainerStyled = styled.div`
  position: relative;
  display: flex;
  margin-bottom: 20px;
`;

const LabelStyled = styled.div`
  display: inline-block;
  vertical-align: bottom;
  line-height: 26px;
`;

const selectClassName = css`
  align-self: flex-start;
  margin-top: 10px;
`;

const containerStyle = css`
  flex-grow: 1;
`;

interface AmountInputProps {
  value: string;
  error?: string;
  pallete?: 'purple' | 'blue';
  onChange?: (value: string) => void; //TODO
}

const REG_AMOUNT = /^(?!0\d)(\d+)(\.)?(\d+)?$/;

const rateStyle = css`
  position: absolute;
  top: 43px;
  left: 15px;
  font-size: 12px;
`;

const AmountInput: React.FC<AmountInputProps> = ({
  value, error, pallete = 'purple', onChange,
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
        valid={!error}
        label={error}
        value={value}
        pallete={pallete}
        maxLength={16}
        placeholder="0"
        className={containerStyle}
        onInput={handleInput}
      />
      {!error && <Rate value={parseFloat(value)} className={rateStyle} />}
    </ContainerStyled>
  );
};

export default AmountInput;
