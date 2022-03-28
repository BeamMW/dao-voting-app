/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useEffect } from 'react';
import { Button, AmountInput, Popup, Rate } from '@app/shared/components';
import { IconCancel, IconWithdrawBlue, IconAddMax } from '@app/shared/icons';
import { useDispatch, useSelector } from 'react-redux';
import { selectErrorMessage, selectSystemState } from '@app/shared/store/selectors';
import { useFormik } from 'formik';
import { toGroths, fromGroths } from '@core/appUtils';
import { UserWithdraw } from '@core/api';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { selectUserView } from '@app/containers/Main/store/selectors';
import { selectAppParams, selectBlocksLeft } from '@app/containers/Main/store/selectors';
interface WithdrawPopupProps {
  visible?: boolean;
  onCancel?: ()=>void;
}

interface WithdrawFormData {
    withdraw_amount: string;
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
            color: #0BCCF7;
            margin-left: 10px;
        }
    }

    > .fee-rate {
        align-self: start;
        font-size: 12px;
        margin-left: 31px;
    }
`;

const InfoContainer = styled.div`
    font-size: 12px;
    color: rgba(255, 255, 255, .7);
    font-style: italic;
    margin-top: 30px;
`;

const WithdrawButtonsClass = css`
    max-width: 138px !important;
`;

const AmountContainer = styled.div`
    display: flex;
    flex-align: row;

    > .amount-input-class {
        max-width: 275px !important;
    }

    > .amount-max-class {
        margin-top: 14px;
        margin-left: 17px;
        font-weight: bold;
        font-size: 14px;
        color: #0BCCF7;
        display: flex;
    }
`;

const AddMaxStyled = styled.div`
    position: absolute;
    cursor: pointer;
    display: flex;
    align-items: center;

    > .add-max-icon {
        margin-top: 2px;
    }

    > .add-max-text {
        margin-left: 11px;
    }
`;

const WithdrawPopup: React.FC<WithdrawPopupProps> = ({ visible, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>();
  const [warned, setWarned] = useState(false);
  const dispatch = useDispatch();
  const error = useSelector(selectErrorMessage());
  const userViewData = useSelector(selectUserView());
  const appParams = useSelector(selectAppParams());
  const [nextEpochDate, setNextEpochStartDate] = useState(null);
  const systemState = useSelector(selectSystemState());
  const blocksLeft = useSelector(selectBlocksLeft());

  useEffect(() => {
    let timestamp = systemState.current_state_timestamp * 1000 - (appParams.epoch_dh - blocksLeft) * 60000;
    const currentTime = new Date(timestamp);
    const dateFromString = currentTime.getDate() + ' '
    + currentTime.toLocaleString('default', { month: 'short' });
    timestamp = timestamp + appParams.epoch_dh * 60000;
    const currentPlusOne = new Date(timestamp);
    const dateToString = currentPlusOne.getDate() + ' '
      + currentPlusOne.toLocaleString('default', { month: 'short' });
    setNextEpochStartDate(`${dateFromString} - ${dateToString}, ${currentPlusOne.getFullYear().toString().substr(-2)}`);
  }, [blocksLeft]);

  const formik = useFormik<WithdrawFormData>({
    initialValues: {
        withdraw_amount: '',
    },
    isInitialValid: false,
    //validate: (e) => validate(e, setHint),
    onSubmit: (value) => {
        UserWithdraw(toGroths(parseFloat(value.withdraw_amount)));
        onCancel();
    },
  });

  const {
    values, setFieldValue, errors, submitForm,
  } = formik;

  const handleAssetChange = (e: string) => {
    setFieldValue('withdraw_amount', e, true);
  };

  const handleAddMax = () => {
    setFieldValue('withdraw_amount', fromGroths(userViewData.stake_active), true)
  }

  return (
    <Popup
      visible={visible}
      title="Withdraw"
      cancelButton={(
        <Button variant='ghost' className={WithdrawButtonsClass} icon={IconCancel} onClick={onCancel}>
          cancel
        </Button>
      )}
      confirmButton={(
        <Button variant='regular' className={WithdrawButtonsClass} pallete='blue'
        icon={IconWithdrawBlue} onClick={submitForm}>
          withdraw
        </Button>
      )}
      onCancel={onCancel}
    >
        <AmountContainer>
            <span className='amount-input-class'>
                <AmountInput
                    pallete='blue'
                    value={values.withdraw_amount}
                    error={errors.withdraw_amount?.toString()}
                    onChange={(e) => handleAssetChange(e)}
                />
            </span>
            <span className='amount-max-class'>
                <AddMaxStyled onClick={handleAddMax}>
                    <IconAddMax className='add-max-icon'/>
                    <span className='add-max-text'>max</span>
                </AddMaxStyled>
            </span>
        </AmountContainer>
        <FeeContainer>
            <div className='fee-head'>
                <span className='title'>Fee</span>
                <span className='value'>0.0011 BEAM</span>
            </div>
            <Rate value={0.0011} className='fee-rate'/>
        </FeeContainer>
        <InfoContainer>
            <div>Withdrawing will decrease your voting power in current epoch #{appParams.current.iEpoch}</div>
            <div>({nextEpochDate})</div>
        </InfoContainer>
    </Popup>
  );
};

export default WithdrawPopup;
