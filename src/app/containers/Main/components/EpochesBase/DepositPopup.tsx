/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';

import { Button, Input, Popup } from '@app/shared/components';

import { IconCancel, IconDepositBlue } from '@app/shared/icons';

import { useDispatch, useSelector } from 'react-redux';
//import { deleteWallet } from '@app/containers/Settings/store/actions';
import { selectErrorMessage } from '@app/shared/store/selectors';

interface RemovePopupProps {
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
}

const DepositPopup: React.FC<RemovePopupProps> = ({ visible, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>();
  const [warned, setWarned] = useState(false);
  const dispatch = useDispatch();
  const error = useSelector(selectErrorMessage());

  const handleConfirm: React.MouseEventHandler = () => {
    // if (warned) {
    //   const { value } = inputRef.current;
    //   dispatch(deleteWallet.request(value));
    // } else {
    //   setWarned(true);
    // }
  };

  return (
    <Popup
      visible={visible}
      title="Deposit"
      cancelButton={(
        <Button variant="ghost" icon={IconCancel} onClick={onCancel}>
          cancel
        </Button>
      )}
      confirmButton={(
        <Button variant="regular" pallete='purple' icon={IconDepositBlue} onClick={handleConfirm}>
          deposit
        </Button>
      )}
      onCancel={onCancel}
    >
      deposit content
    </Popup>
  );
};

export default DepositPopup;
