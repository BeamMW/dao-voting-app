/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useEffect } from 'react';
import { styled } from '@linaria/react';
import { Button, AmountInput, Popup, Rate } from '@app/shared/components';
import { IconCancel, IconDepositBlue } from '@app/shared/icons';

import { useDispatch, useSelector } from 'react-redux';
import { selectErrorMessage, selectSystemState } from '@app/shared/store/selectors';
import { useFormik } from 'formik';
import { toGroths } from '@core/appUtils';
import { UserDeposit } from '@core/api';
import { css } from '@linaria/core';
import { selectAppParams, selectBlocksLeft } from '@app/containers/Main/store/selectors';

interface DepositPopupProps {
  visible?: boolean;
  onCancel?: ()=>void;
}

interface DepositFormData {
  send_amount: string;
}

const FeeContainer = styled.div`
    margin-top: 20px;
    margin-left: 15px;
    display: flex;
    flex-direction: column;
    
    > .fee-head {
        align-self: start;

        > .title {
            font-size: 12px;
            color: rgba(255, 255, 255, .5);
        }

        > .value {
            font-weight: 500;
            font-size: 14px;
            color: #DA68F5;
            margin-left: 10px;
        }
    }

    > .fee-rate {
        align-self: start;
        font-size: 12px;
        margin-left: 31px;
    }
`;

const DepositPopupClass = css`
    width: 450px !important;
`;

const InfoContainer = styled.div`
    font-size: 12px;
    color: rgba(255, 255, 255, .7);
    font-style: italic;
    margin-top: 30px;
`;

const DepositButtonsClass = css`
    max-width: 138px !important;
`;

const DepositPopup: React.FC<DepositPopupProps> = ({ visible, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>();
  const [warned, setWarned] = useState(false);
  const dispatch = useDispatch();
  const error = useSelector(selectErrorMessage());
  const appParams = useSelector(selectAppParams());
  const [nextEpochDate, setNextEpochStartDate] = useState(null);
  const systemState = useSelector(selectSystemState());
  const blocksLeft = useSelector(selectBlocksLeft());

  useEffect(() => {
    let timestamp = systemState.current_state_timestamp * 1000 + blocksLeft * 60000;
    const currentTime = new Date(timestamp);
    const dateFromString = currentTime.getDate() + ' '
    + currentTime.toLocaleString('en-US', { month: 'short' });
    timestamp = timestamp + appParams.epoch_dh * 60000;
    const currentPlusOne = new Date(timestamp);
    const dateToString = currentPlusOne.getDate() + ' '
      + currentPlusOne.toLocaleString('en-US', { month: 'short' });
    setNextEpochStartDate(`${dateFromString} - ${dateToString}, ${currentPlusOne.getFullYear().toString().substr(-2)}`);
  }, [blocksLeft]);

  const formik = useFormik<DepositFormData>({
    initialValues: {
      send_amount: '',
    },
    isInitialValid: false,
    //validate: (e) => validate(e, setHint),
    onSubmit: (value) => {
        UserDeposit(toGroths(parseFloat(value.send_amount)));
        onCancel();
        resetForm();
    },
  });

  const {
    values, setFieldValue, errors, submitForm, resetForm
  } = formik;

  const handleAssetChange = (e: string) => {
    setFieldValue('send_amount', e, true);
  };

  return (
    <Popup
      className={DepositPopupClass}
      visible={visible}
      title="Deposit"
      cancelButton={(
        <Button className={DepositButtonsClass} variant="ghost" icon={IconCancel} onClick={()=>{
          onCancel();
          resetForm();
        }}>
          cancel
        </Button>
      )}
      confirmButton={(
        <Button className={DepositButtonsClass} variant="regular" pallete='purple' icon={IconDepositBlue} onClick={submitForm}>
          deposit
        </Button>
      )}
      onCancel={()=>{
        onCancel();
        resetForm();
      }}
    >
        <form onSubmit={submitForm}>
            <AmountInput
              from='deposit'
              value={values.send_amount}
              error={errors.send_amount?.toString()}
              onChange={(e) => handleAssetChange(e)}
            />
            <FeeContainer>
                <div className='fee-head'>
                    <span className='title'>Fee</span>
                    <span className='value'>0.011 BEAM</span>
                </div>
                <Rate value={0.011} className='fee-rate'/>
            </FeeContainer>
            <InfoContainer>
                <div>Depositing will increase your voting power in next epoch #{appParams.current.iEpoch + 1}</div>
                <div>({nextEpochDate})</div>
            </InfoContainer>
        </form>
    </Popup>
  );
};

export default DepositPopup;
