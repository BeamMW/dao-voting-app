import React from 'react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { truncate } from '@core/utils';

import { useSelector } from 'react-redux';
import Input from './Input';

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

const REG_AMOUNT = /^\d+$/;

const AmountInput: React.FC<AmountInputProps> = ({
  value, error, onChange,
}) => {
  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value: raw } = event.target;

    if ((raw !== '' && !REG_AMOUNT.test(raw))) {
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
        maxLength={16}
        className={containerStyle}
        onInput={handleInput}
      />
      {!error}
    </ContainerStyled>
  );
};

export default AmountInput;
