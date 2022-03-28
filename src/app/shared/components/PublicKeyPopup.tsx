/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Button, Input, Popup } from '@app/shared/components';
import { IconCancel, IconCopyBlue, IconCopyWhite } from '@app/shared/icons';
import { useDispatch, useSelector } from 'react-redux';
import { selectErrorMessage } from '@app/shared/store/selectors';
import { copyToClipboard } from '@core/appUtils';
import { selectPublicKey } from '@app/containers/Main/store/selectors';

interface RemovePopupProps {
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
}

const PopupClass = css`
  width: 760px;
`;

const CloseButtonClass = css`
  max-width: 125px !important;
`;

const CopyButtonClass = css`
  max-width: 190px !important;
`;

const CopyIconClass = css`
  margin-left: 10px;
  cursor: pointer;
`;

const StyledContent = styled.div`
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PublicKeyPopup: React.FC<RemovePopupProps> = ({ visible, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>();
  const [warned, setWarned] = useState(false);
  const dispatch = useDispatch();
  const pKey = useSelector(selectPublicKey());

  const handleConfirm: React.MouseEventHandler = async () => {
    await copyToClipboard(pKey);
    onCancel(null);
  };

  const handleCopy = async () => {
    await copyToClipboard(pKey);
  }

  return (
    <Popup
      className={PopupClass}
      visible={visible}
      title="Public key"
      cancelButton={(
        <Button variant="ghost" className={CloseButtonClass} icon={IconCancel} onClick={onCancel}>
          close
        </Button>
      )}
      confirmButton={(
        <Button variant="regular" className={CopyButtonClass} pallete='green' icon={IconCopyBlue} onClick={handleConfirm}>
          copy and close
        </Button>
      )}
      onCancel={onCancel}
    >
      {pKey ? (<StyledContent>{pKey}<IconCopyWhite onClick={handleCopy} className={CopyIconClass}/></StyledContent>) : null}
    </Popup>
  );
};

export default PublicKeyPopup;
