import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { ROUTES } from '@app/shared/constants';
import { ClockCircular, IconWithdraw, IconDeposit } from '@app/shared/icons';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button } from '@app/shared/components';
import { selectSystemState } from '@app/shared/store/selectors';
import { selectAppParams, selectContractHeight } from '@app/containers/Main/store/selectors';

const StyledStats = styled.div`
  width: 100%;
  height: 250px;
  background-color: rgba(255, 255, 255, .05);
  border-radius: 10px;
  padding: 20px;
`;

const StatsTitle = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const EpochTitle = styled.span`
  font-weight: bold;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 3.11111px;
`;

const ExpiredTimer = styled.span`
  font-style: italic;
  font-size: 14px;
  line-height: 17px;
`;

const TimerValue = styled.span`
  margin-left: 10px;
`;

const Separator = styled.div`
  height: 1px;
  width: 100%;
  margin: 20px 0;
  background-color: rgba(255, 255, 255, .1);
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: row;
`;

const LeftStats = styled.span`
  min-width: 400px;
`;

const MiddleStats = styled.span`
  margin-left: 50px;
`;

const VotingsProgress = styled.span`
  width: 400px
`;

const ButtonLinkClass = css`
  font-size: 16px !important;
  font-weight: normal !important;
  margin-left: auto !important;
`;

const WithdrawClass = css`
  margin-left: 30px !important;
`;

const EpochesBase: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const appParams = useSelector(selectAppParams());
  const systemState = useSelector(selectSystemState());
  const cHeight = useSelector(selectContractHeight());

  
  const [expiresData, setExpiresData] = useState('');

  useEffect(
    () => {
      const blocksLeft = appParams.epoch_dh * appParams.current.iEpoch + cHeight - systemState.current_height;
      if (blocksLeft > 0) {
        const d = Math.floor(blocksLeft / (60*24));
        const h = Math.floor(blocksLeft % (60*24) / 60);
        const m = Math.floor(blocksLeft % 60);
        setExpiresData(`${d} d ${h} h ${m} m`);
      }
    },
    [cHeight, systemState],
  );

  return (
    <Window>
      <StyledStats>
        <StatsTitle>
          <EpochTitle>EPOCH #{appParams.current.iEpoch}</EpochTitle>
          <ExpiredTimer>
            <ClockCircular/>
            { expiresData.length ?
              <TimerValue>expires in {expiresData}</TimerValue> : null
            }
          </ExpiredTimer>
        </StatsTitle>
        <StyledSection>
          <LeftStats>
            {/* <StyledTotalLocked></StyledTotalLocked>
            <StyledStaked></StyledStaked> */}
          </LeftStats>
          <MiddleStats>
            <Button pallete='purple' variant='link' icon={IconDeposit}>deposit</Button>
            <Button className={WithdrawClass} pallete='blue' variant='link' icon={IconWithdraw}>withdraw</Button>
          </MiddleStats>
          <Button className={ButtonLinkClass} pallete='green' variant='link'>Show my public key</Button>
        </StyledSection>

        <Separator/>

        <StyledSection>
          <LeftStats></LeftStats>
          <MiddleStats></MiddleStats>
          <Button className={ButtonLinkClass} pallete='green' variant='link'>Show future votings</Button>
        </StyledSection>
      </StyledStats>
    </Window>
  );
};

export default EpochesBase;
