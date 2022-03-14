import React from 'react';
import { styled } from '@linaria/react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valid?: boolean;
  variant?: 'regular' | 'gray' | 'proposal';
  pallete?: 'purple' | 'blue';
  margin?: 'none' | 'large';
}

const ContainerStyled = styled.div<InputProps>`
  position: relative;
  min-height: 53px;
  margin-bottom: ${({ margin }) => (margin === 'none' ? 0 : 50)}px;
`;

const InputStyled = styled.input<InputProps>`
  width: 100%;
  height: 33px;
  line-height: 31px;
  border: none;
  border-bottom: 2px solid transparent;
  background-color: transparent;
  font-size: 14px;
  color: white;

  &::placeholder {
    color: white;
    opacity: 0.5;
    font-size: 14px;
    transform: translateX(1px);
  }

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InputRegularStyled = styled(InputStyled)`
  border-color: ${({ valid }) => (valid ? 'var(--color-green)' : 'var(--color-red)')};
`;

const InputGrayStyled = styled(InputStyled)`
  border-width: 1px;
  border-color: ${({ valid }) => (valid ? 'rgba(255,255,255,0.3)' : 'var(--color-red)')};
`;

const InputProposalStyled = styled(InputGrayStyled)<{ pallete: string }>`
  font-size: 16px;
  font-weight: normal;
  color: ${({ pallete }) => `var(--color-${pallete})`};
  height: 45px;
  background-color: rgba(255, 255, 255, .05);
  border: none;
  padding: 0 15px;
  border-radius: 10px;

  &::placeholder {
    font-size: 16px;
  }
`;

const LabelStyled = styled.div<InputProps>`
  text-align: start;
  margin-top: 4px;
  font-family: SFProDisplay;
  font-size: 14px;
  font-style: italic;
  color: ${({ valid }) => (valid ? 'rgba(255, 255, 255, .7)' : 'var(--color-red)')};
`;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label, valid = true, variant = 'regular', margin = 'none', pallete, className, ...rest
  }, ref) => {
    const InputComponent = {
      regular: InputRegularStyled,
      gray: InputGrayStyled,
      proposal: InputProposalStyled,
    }[variant];

    return (
      <ContainerStyled className={className} margin={margin}>
        <InputComponent ref={ref} valid={valid} pallete={pallete} {...rest} />
        {!!label && <LabelStyled valid={valid}>{label}</LabelStyled>}
      </ContainerStyled>
    );
  },
);

export default Input;
