import { styled } from '@linaria/react';
import { css, cx } from '@linaria/core';
import React, { useEffect, useState } from 'react';

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
  depositPopupUpdate: (state: boolean)=>void;
  isDepositVisible: boolean;
  withdrawPopupUpdate: (state: boolean)=>void;
  isWithdrawVisible: boolean;
  isWithProgress?: boolean;
}

const StyledStats = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, .05);
  border-radius: 10px;
  padding: 20px;

  > .stats-title-class {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  > .stats-title-class .stats-epoch-class {
    font-weight: bold;
    font-size: 14px;
    line-height: 17px;
    letter-spacing: 3.11111px;
  }
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
  align-items: stretch;
`;

const LeftStats = styled.span`
  min-width: 400px;
  display: flex;
  flex-direction: row;
`;

const LeftStatsProgress = styled(LeftStats)`
    flex-direction: column;

    > .progress {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    > .progress .progress-percentage {
        margin-left: 10px;
        font-size: 12px;
        color: rgba(255, 255, 255, .5);
    }

    > .progress-title {
        margin-bottom: 10px;
        font-size: 12px;
        color: rgba(255, 255, 255, .5);
    }
`;

const MiddleStats = styled.span`
  margin-left: 50px;

  > .next-epoch-title {
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 3.11111px;
    color: rgba(255, 255, 255, .5);
  }

  > .next-epoch-date {
      font-size: 14px;
      margin-top: 22px;
  }
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

  > .voting-power-class {
      font-size: 12px;
      font-style: italic;
      color: rgba(255, 255, 255, .7);
      margin-left: 27px;
  }
`;

const ButtonLinkClass = css`
  font-size: 16px !important;
  font-weight: normal !important;
  margin-left: auto !important;
`;

const ButtonBottomLinkClass = css`
    font-size: 16px !important;
    font-weight: normal !important;
    margin: auto 0 0 auto !important
`;

const WithdrawClass = css`
  margin-left: 30px !important;
`;

const EpochStatsSection: React.FC<SeedListProps> = ({
  data,
  depositPopupUpdate,
  isDepositVisible,
  withdrawPopupUpdate,
  isWithdrawVisible,
  className,
  isWithProgress = true
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const appParams = useSelector(selectAppParams());
    const systemState = useSelector(selectSystemState());
    const cHeight = useSelector(selectContractHeight());
    const userViewData = useSelector(selectUserView())

    const handleDeposit = () => {
        depositPopupUpdate(!isDepositVisible);
    };

    const handleWithdraw = () => {
        withdrawPopupUpdate(!isWithdrawVisible);
    };

    return (
        <StyledStats className={className}>
            <div className='stats-title-class'>
                <span className='stats-epoch-class'>EPOCH #{appParams.current.iEpoch}</span>
                <ExpiresTimer appParams={appParams} systemState={systemState} cHeight={cHeight}></ExpiresTimer>
            </div>
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
                        <div className='voting-power-class'>Voting power is 10%</div>
                    </StyledStaked>
                </LeftStats>
                <MiddleStats>
                    <Button pallete='purple' 
                    variant='link' 
                    onClick={handleDeposit} 
                    icon={IconDeposit}>
                        deposit
                    </Button>
                    <Button pallete='blue'
                    className={WithdrawClass}
                    onClick={handleWithdraw}
                    variant='link'
                    icon={IconWithdraw}>
                        withdraw
                    </Button>
                </MiddleStats>
                <Button className={ButtonLinkClass} pallete='green' variant='link'>Show my public key</Button>
            </StyledSection>

            { isWithProgress ?
            (<>
                <Separator/>

                <StyledSection>
                    <LeftStatsProgress>
                        <div className='progress-title'>Your completed proposals</div>                        
                        <div className='progress'>
                            <ProgressBar active={true} percent={20}></ProgressBar>
                            <span className='progress-percentage'>50% (3 of 5)</span>
                        </div>
                    </LeftStatsProgress>
                    <MiddleStats>
                        <div className='next-epoch-title'>NEXT EPOCH #232</div>
                        <div className='next-epoch-date'>05.02.2022 - 23.04.2022</div>
                    </MiddleStats>
                    <Button className={ButtonBottomLinkClass}
                    onClick={() => navigate(ROUTES.MAIN.FUTURE_EPOCHS)}
                    pallete='green' variant='link'>Show future votings</Button>
                </StyledSection>
            </>) : null}
        </StyledStats>
    );
};

export default EpochStatsSection;
