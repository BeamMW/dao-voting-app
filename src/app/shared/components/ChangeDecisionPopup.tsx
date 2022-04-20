/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useEffect } from 'react';
import { Button, AmountInput, Popup, Rate } from '@app/shared/components';
import { IconCancel, IconChangeBlue } from '@app/shared/icons';
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
  voted: number;
  onChangeResult: (res: boolean)=>void;
}

const StyledContent = styled.div`

`;

const WithdrawPopupClass = css`
    width: 450px !important;
`;

const WithdrawButtonsClass = css`
    max-width: 145px !important;
`;

const ChangeDecisionPopup: React.FC<WithdrawPopupProps> = ({ visible, onCancel, voted, onChangeResult }) => {
  const userViewData = useSelector(selectUserView());
  const appParams = useSelector(selectAppParams());
  const [nextEpochDate, setNextEpochStartDate] = useState(null);
  const systemState = useSelector(selectSystemState());
  const blocksLeft = useSelector(selectBlocksLeft());

  return (
    <Popup
      className={WithdrawPopupClass}
      visible={visible}
      title="Change decision"
      cancelButton={(
        <Button variant='ghost' className={WithdrawButtonsClass} icon={IconCancel} onClick={()=>{
            onChangeResult(false);
            onCancel();
          }}>
          cancel
        </Button>
      )}
      confirmButton={(
        <Button variant='regular' className={WithdrawButtonsClass} pallete='green'
        icon={IconChangeBlue} onClick={()=>{
            onChangeResult(true);
            onCancel();
        }}>
          change
        </Button>
      )}
      onCancel={()=> {
        onChangeResult(false);
        onCancel();
      }}
    >
    <StyledContent>
        You voted {voted > 0 ? 'YES' : 'NO'}. Are you sure you want to change your current decision in proposal “Decrease transaction’s 
        fee for Smart Contract transaction”?
    </StyledContent> 
    </Popup>
  );
};

export default ChangeDecisionPopup;
