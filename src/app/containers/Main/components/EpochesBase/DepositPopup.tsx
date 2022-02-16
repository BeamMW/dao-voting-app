/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';

import { Button, AmountInput, Popup } from '@app/shared/components';

import { IconCancel, IconDepositBlue } from '@app/shared/icons';

import { useDispatch, useSelector } from 'react-redux';
//import { deleteWallet } from '@app/containers/Settings/store/actions';
import { selectErrorMessage } from '@app/shared/store/selectors';
import { useFormik } from 'formik';

interface RemovePopupProps {
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
}

interface DepositFormData {
    send_amount: string;
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

  const formik = useFormik<DepositFormData>({
    initialValues: {
      send_amount: '',
    },
    isInitialValid: false,
    //validate: (e) => validate(e, setHint),
    onSubmit: (value) => {
        console.log('submitted: ', value);
    },
  });

  const {
    values, setFieldValue, errors, submitForm,
  } = formik;

  const handleAssetChange = (e: string) => {
    setFieldValue('send_amount', e, true);
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
        <Button variant="regular" pallete='purple' icon={IconDepositBlue} onClick={submitForm}>
          deposit
        </Button>
      )}
      onCancel={onCancel}
    >
        <form onSubmit={submitForm}>
            <AmountInput
                value={values.send_amount}
                error={errors.send_amount?.toString()}
                onChange={(e) => handleAssetChange(e)}
            />
        </form>
    </Popup>
  );
};

export default DepositPopup;
