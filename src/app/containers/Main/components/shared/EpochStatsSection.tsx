import { styled } from '@linaria/react';
import { css, cx } from '@linaria/core';
import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { IconWithdraw, IconDeposit, IconBeamx } from '@app/shared/icons';
import ExpiresTimer  from './ExpiresTimer';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button, ProgressBar } from '@app/shared/components';
import { selectSystemState } from '@app/shared/store/selectors';
import { selectAppParams, selectContractHeight, selectUserView } from '@app/containers/Main/store/selectors';
import { fromGroths } from '@core/appUtils';

interface SeedListProps {
  data: any;
  className?: string;
}

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
  display: flex;
  flex-direction: row;
`;

const MiddleStats = styled.span`
  margin-left: 50px;
`;

const VotingsProgress = styled.span`
  width: 400px
`;

const SubSectionTitle = styled.div`
  font-size: 12px;
  opacity: 0.5;
  margin-bottom: 6px;
`;

const SubSectionValue = styled.div`
  align-items: center;
  display: flex;
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;

  > span {
    margin-left: 8px;
  }
`;

const StyledTotalLocked = styled.span`

`;

const StyledStaked = styled.span`
  margin-left: 60px;
`;

const ButtonLinkClass = css`
  font-size: 16px !important;
  font-weight: normal !important;
  margin-left: auto !important;
`;

const WithdrawClass = css`
  margin-left: 30px !important;
`;

const EpochStatsSection: React.FC<SeedListProps> = ({
  data,
  className
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const appParams = useSelector(selectAppParams());
    const systemState = useSelector(selectSystemState());
    const cHeight = useSelector(selectContractHeight());
    const userViewData = useSelector(selectUserView())

    return (
        <StyledStats className={className}>
            <StatsTitle>
            <EpochTitle>EPOCH #{appParams.current.iEpoch}</EpochTitle>
            <ExpiresTimer appParams={appParams} systemState={systemState} cHeight={cHeight}></ExpiresTimer>
            </StatsTitle>
            <StyledSection>
            <LeftStats>
                <StyledTotalLocked>
                <SubSectionTitle>Total value locked</SubSectionTitle>
                <SubSectionValue>
                    <IconBeamx/>
                    <span>0 BEAMX</span>
                </SubSectionValue>
                </StyledTotalLocked>
                <StyledStaked>
                <SubSectionTitle>Your staked</SubSectionTitle>
                <SubSectionValue>
                    <IconBeamx/>
                    <span>{fromGroths(userViewData.stake_active)} BEAMX</span>
                </SubSectionValue>
                <div>Voting power is 10%</div>
                </StyledStaked>
            </LeftStats>
            <MiddleStats>
                <Button pallete='purple' variant='link' icon={IconDeposit}>deposit</Button>
                <Button className={WithdrawClass} pallete='blue' variant='link' icon={IconWithdraw}>withdraw</Button>
            </MiddleStats>
            <Button className={ButtonLinkClass} pallete='green' variant='link'>Show my public key</Button>
            </StyledSection>

            <Separator/>

            <StyledSection>
            <LeftStats>
                <ProgressBar active={true} percent={20}></ProgressBar>
            </LeftStats>
            <MiddleStats></MiddleStats>
            <Button className={ButtonLinkClass} pallete='green' variant='link'>Show future votings</Button>
            </StyledSection>
        </StyledStats>
    );
};

export default EpochStatsSection;
