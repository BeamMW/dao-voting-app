import React, {
  ReactElement, useEffect, useRef, useState,
} from 'react';
import { styled } from '@linaria/react';

import { css } from '@linaria/core';
//import config from '@app/config';
import Angle from './Angle';

const ContainerStyled = styled.div`
  display: inline-block;
  position: relative;
  margin-left: 15px;
`;

const SelectStyled = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1;
  margin-top: 8px;
  padding: 13px 0;
  border-radius: 2px;
  background-color: #00446C;
  max-height: 200px;
  overflow-y: auto;

  ::-webkit-scrollbar {
    width: 5px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
   
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.7); 
  }
`;

const OptionStyled = styled.div`
  padding: 7px 20px;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  font-size: 14px;
  display: flex;
  align-items: center;

  &:hover,
  &:active {
    background-color: rgba(255, 255, 255, 0.07);
  }
`;

const OptionActiveStyled = styled(OptionStyled)`
  cursor: default;
  color: var(--color-green);
  display: flex;
  align-items: center;

  &:hover,
  &:active {
    background-color: transparent;
  }
`;

const ButtonStyled = styled.button`
  line-height: 26px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  padding: 0;
  border: none;
  background-color: transparent;
  text-decoration: none;
  color: white;
  white-space: nowrap;

  > .title-text {
    font-weight: 400;
    font-size: 14px;
    color: rgba(255, 255, 255, .7);
  }

  > .title-value {
    color: rgba(255, 255, 255, .7);
    margin-left: 10px;
    font-weight: 700;
    font-size: 14px;
  }

  &:hover,
  &:active {
    background-color: transparent;
  }
`;

const angleStyle = css`
  display: inline-block;
  vertical-align: text-top;
  margin-left: 8px;
`;

interface OptionProps {
  // eslint-disable-next-line
  value: any;
  active?: boolean;
  onClick?: React.MouseEventHandler;
}

export const Option: React.FC<OptionProps> = ({ active, children, onClick }) => {
  if (active) {
    return <OptionActiveStyled>#{children}</OptionActiveStyled>;
  }

  return <OptionStyled onClick={onClick}>#{children}</OptionStyled>;
};

interface SelectProps<T = any> {
  value: T;
  className?: string;
  onSelect: (value: T) => void;
}

export const Select: React.FC<SelectProps> = ({
  value, className, children, onSelect,
}) => {
  const [opened, setOpened] = useState(false);
  const selectRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (opened) {
      const { current } = selectRef;
      if (current) {
        current.focus();
      }
    }
  }, [opened]);

  const array = React.Children.toArray(children);

  const disabled = array.length === 1;

  const options = array.map((child) => {
    const { value: next } = (child as React.ReactElement).props;
    const active = value === next;

    const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
      if (active) {
        event.preventDefault();
        return;
      }

      onSelect(next);
      setOpened(false);
    };

    return React.cloneElement(child as React.ReactElement, {
      active,
      disabled,
      onClick: handleClick,
    });
  });

  const selected = array.find((child) => {
    const { value: current } = (child as ReactElement).props;
    return value === current;
  });

  const handleMouseDown = () => {
    setOpened(!opened);
  };

  const handleBlur = () => {
    setOpened(false);
  };

  return (
    <ContainerStyled className={className}>
      <ButtonStyled type="button" onMouseDown={handleMouseDown} disabled={disabled}>
        <span className='title-text'>Epoch</span> 
        {selected && <span className='title-value'>#{(selected as ReactElement).props.children}</span>}
        {options.length > 1 && <Angle className={angleStyle} value={opened ? 180 : 0} margin={opened ? 1 : 3} />}
      </ButtonStyled>
      {opened && (
        <SelectStyled ref={selectRef} tabIndex={-1} onBlur={handleBlur}>
          {options}
        </SelectStyled>
      )}
    </ContainerStyled>
  );
};

export default Select;
