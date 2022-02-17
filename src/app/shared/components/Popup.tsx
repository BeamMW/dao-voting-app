import React from 'react';
import { styled } from '@linaria/react';

import { IconCancel } from '@app/shared/icons';

import Backdrop from './Backdrop';
import Button from './Button';

interface PopupProps {
  title?: string;
  cancelButton?: React.ReactElement;
  confirmButton?: React.ReactElement;
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
  footerClass?: string;
  className?: string;
}

const ContainerStyled = styled.div`
  transform: translateX(-50%) translateY(-50%);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 391px;
  padding: 30px 20px;
  border-radius: 10px;
  background-color: var(--color-popup);
  text-align: center;
  color: white;

  > .cancel-header {
    right: 4px;
    top: 10px;
    position: absolute;
  }
`;

const TitleStyled = styled.h2`
  font-size: 16px;
  margin: 0;
  margin-bottom: 20px;
`;

const FooterStyled = styled.div`
  display: flex;
  margin: 0 -7px;
  margin-top: 20px;
  justify-content: center;

  > button {
    margin: 0 15px !important;
  }
  &.justify-right {
    justify-content: right;
    margin-top: 40px;
  }
  &.qr-code-popup {
    > button {
      margin: 0 auto !important;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const Popup: React.FC<PopupProps> = ({
  title,
  visible,
  onCancel,
  cancelButton = (
    <Button variant="ghost" icon={IconCancel} onClick={onCancel}>
      cancel
    </Button>
  ),
  confirmButton,
  children,
  footerClass,
  className
}) => (visible ? (
  <Backdrop onCancel={onCancel}>
    <ContainerStyled className={className}>
      <TitleStyled>{title}</TitleStyled>
      {/* <Button className="cancel-header" variant="icon" pallete="white" icon={IconCancel} onClick={onCancel} /> */}
      {children}
      <FooterStyled className={footerClass}>
        {cancelButton}
        {confirmButton}
      </FooterStyled>
    </ContainerStyled>
  </Backdrop>
) : null);

export default Popup;
