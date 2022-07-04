/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Button, Popup } from '@app/shared/components';
import { IconCancel, IconChangeBlue } from '@app/shared/icons';
import { useSelector } from 'react-redux';
import { selectSystemState } from '@app/shared/store/selectors';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { selectUserView } from '@app/containers/Main/store/selectors';
import { selectAppParams, selectBlocksLeft } from '@app/containers/Main/store/selectors';
interface WithdrawPopupProps {
  visible?: boolean;
  onCancel?: ()=>void;
  voted: number;
  propTitle: string;
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

const ChangeDecisionPopup: React.FC<WithdrawPopupProps> = ({ visible, onCancel, voted, propTitle, onChangeResult }) => {
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
        You voted {voted > 0 ? 'YES' : 'NO'}. Are you sure you want to change your current decision in proposal “{propTitle}”?
    </StyledContent> 
    </Popup>
  );
};

export default ChangeDecisionPopup;
