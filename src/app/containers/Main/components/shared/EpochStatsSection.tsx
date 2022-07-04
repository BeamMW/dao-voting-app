import { styled } from '@linaria/react';
import { css, cx } from '@linaria/core';
import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { 
  IconWithdraw,
  IconDeposit,
  IconBeamx } from '@app/shared/icons';
import ExpiresTimer  from './ExpiresTimer';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ProgressBar } from '@app/shared/components';
import { selectSystemState } from '@app/shared/store/selectors';
import {
  selectAppParams,
  selectTotalsView,
  selectCurrentProposals,
  selectPopupsState,
  selectContractHeight,
  selectBlocksLeft,
  selectWithdrawedAmount,
  selectDepositedAmount,
  selectUserView } from '@app/containers/Main/store/selectors';
import { fromGroths, calcVotingPower, numFormatter } from '@core/appUtils';
import { setPopupState } from '@app/containers/Main/store/actions';

interface SeedListProps {
  className?: string;
  state: 'progress' | 'stake' | 'none'
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
  @media screen and (max-width : 1050px) {
    min-width: 400px;
  }

  @media screen and (min-width : 1050px) {
    min-width: 600px;
  }
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

const MiddleStats = styled.span<{isStake: boolean}>`
  margin-left: ${({ isStake }) => isStake ? 'auto' : '40px'};
  align-self: center;

  > .next-epoch-title {
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 3.1px;
    color: rgba(255, 255, 255, .5);
  }

  > .next-epoch-date {
      font-size: 14px;
      margin-top: 22px;
  }
`;

const PowerStats = styled.span`
  margin-left: 30px;
  align-self: center;

  > .power-value {
    margin-top: 5px;
    font-weight: 700;
    display: flex;
    align-items: center;

    > .power-up-icon {
      margin-left: 5px;
    }
  }

  > .text {
    font-style: italic;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    margin-top: 5px;
    opacity: .7;
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

  @media screen and (max-width : 1050px) {
    > span {
      margin-left: 8px;
      width: 140px;
      word-wrap: break-word;
    }
  }

  @media screen and (min-width : 1050px) {
    > span {
      margin-left: 8px;
      width: 240px;
      word-wrap: break-word;
    }
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
      margin-left: 28px;
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
    margin: auto 0 0 auto !important;
    line-height: 17px;
`;

const WithdrawClass = css`
  margin-left: 30px !important;
`;

const StyledNextEpoch = styled.div`
  > .title {
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 3.1px;
    text-transform: uppercase;
    opacity: 0.5;
  }

  > .content {
    margin-top: 20px;
    display: flex;
    flex-direction: row;

    > .power-add-date {
      margin-left: auto;
      font-style: italic;
      font-size: 12px;
      opacity: 0.7;
      align-self: center;
    }
  }
`;

const StyledIncrease = styled.div`
  text-align: center;
  font-style: italic;
  font-size: 12px;
  opacity: 0.7;
`;

const EpochStatsSection: React.FC<SeedListProps> = ({
  className,
  state
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const appParams = useSelector(selectAppParams());
    const systemState = useSelector(selectSystemState());
    const cHeight = useSelector(selectContractHeight());
    const userViewData = useSelector(selectUserView());
    const totalsView = useSelector(selectTotalsView());
    const popupsState = useSelector(selectPopupsState());
    const blocksLeft = useSelector(selectBlocksLeft());
    const withdrawedAmount = useSelector(selectWithdrawedAmount());
    const depositedAmount = useSelector(selectDepositedAmount());

    const currentProposals = useSelector(selectCurrentProposals());
    const [votes, setVotes] = useState(0);
    const [nextEpochDate, setNextEpochStartDate] = useState(null);
    const [nextEpochStartFrom, setNextEpochStartFrom] = useState(null);

    const [curWithdraw, setCurWithdraw] = useState(null);
    const [curPowerPercent, setCurPowerPercent] = useState(null);
    const [futPowerPercent, setFutPowerPercent] = useState(null);
    
    useEffect(() => {
      let count = 0;
      if (userViewData.current_votes !== undefined) {
        for (let item of userViewData.current_votes) {
          if (item < 255) {
            count += 1;
          }
        }
      }
      setVotes(count);
    }, [userViewData]);

    useEffect(() => {
      const wAmountProcessed = withdrawedAmount > depositedAmount ?
        (withdrawedAmount - depositedAmount) : 
        withdrawedAmount;
      
      if (depositedAmount > 0) {
        setCurWithdraw(numFormatter(fromGroths(wAmountProcessed)));
      } else {
        setCurWithdraw(numFormatter(fromGroths(withdrawedAmount)));
      }

      const percentBefore = 100 / ((totalsView.stake_active + totalsView.stake_passive + wAmountProcessed) / 
        (userViewData.stake_active + userViewData.stake_passive + wAmountProcessed));
      const percentAfter = 100 / ((totalsView.stake_active + totalsView.stake_passive) / 
        (userViewData.stake_active + userViewData.stake_passive));
      const cPowerPercent = percentBefore - percentAfter;

      setCurPowerPercent(cPowerPercent < 1 && cPowerPercent !== 0 ? '< 1' : Number(cPowerPercent).toFixed(2));

      const fPercentAfter = 100 / ((totalsView.stake_active + totalsView.stake_passive) / 
      (userViewData.stake_active + userViewData.stake_passive));
      const fPercentBefore = 100 / (totalsView.stake_active / userViewData.stake_active);

      const fPowerPercent = fPercentAfter - fPercentBefore;

      setFutPowerPercent(fPowerPercent < 1 && fPowerPercent !== 0 ? '< 1' : Number(fPowerPercent).toFixed(2));
    
    }, [userViewData, totalsView]);

    useEffect(() => {
      let timestamp = systemState.current_state_timestamp * 1000 + blocksLeft * 60000;
      const currentTime = new Date(timestamp);
      const dateFromString = ('0' + currentTime.getDate()).slice(-2) + '.' 
        + ('0' + (currentTime.getMonth()+1)).slice(-2) + '.' + currentTime.getFullYear();
      timestamp = timestamp + appParams.epoch_dh * 60000;
      setNextEpochStartFrom(dateFromString);
      const currentPlusOne = new Date(timestamp);
      const dateToString = ('0' + currentPlusOne.getDate()).slice(-2) + '.'
      + ('0' + (currentPlusOne.getMonth()+1)).slice(-2) + '.' + currentPlusOne.getFullYear();
      setNextEpochStartDate(`${dateFromString} - ${dateToString}`);
    }, [blocksLeft]);

    const handleDeposit = () => {
      dispatch(setPopupState({type: 'deposit', state: !popupsState.deposit}));
    };

    const handleWithdraw = () => {
      dispatch(setPopupState({type: 'withdraw', state: !popupsState.withdraw}));
    };

    const handleStakedInfo = () => {
      navigate(ROUTES.MAIN.STAKED_INFO);
    }

    return (
        <StyledStats className={className}>
            <div className='stats-title-class'>
                <span className='stats-epoch-class'>
                  {state === 'stake' ? 'NEXT EPOCH #' + (appParams.current.iEpoch + 1) : 'EPOCH #' + appParams.current.iEpoch}
                </span>
                {state !== 'stake' && <ExpiresTimer appParams={appParams} systemState={systemState} cHeight={cHeight}></ExpiresTimer>}
            </div>
            <StyledSection>
                <LeftStats>
                    <StyledTotalLocked>
                        <SubSectionTitle>Total value locked</SubSectionTitle>
                        <SubSectionValue>
                            <IconBeamx/>
                            <span>{numFormatter(fromGroths(
                              state === 'stake' ? (totalsView.stake_active + totalsView.stake_passive) : totalsView.stake_active
                            ))} BEAMX</span>
                        </SubSectionValue>
                    </StyledTotalLocked>
                    <StyledStaked>
                        <SubSectionTitle>Your staked</SubSectionTitle>
                        <SubSectionValue>
                            <IconBeamx/>
                            <span>{numFormatter(fromGroths(
                              state === 'stake' ? (userViewData.stake_active + userViewData.stake_passive) : userViewData.stake_active
                            ))} BEAMX</span>
                        </SubSectionValue>
                        { totalsView.stake_active > 0 && state !== 'stake' ?
                        (<div className='voting-power-class'>
                          Voting power is {calcVotingPower(userViewData.stake_active, totalsView.stake_active)}%
                        </div>)
                        : null }
                    </StyledStaked>
                </LeftStats>
                {
                  state === 'stake' && totalsView.stake_active > 0 &&
                  <PowerStats>
                    <SubSectionTitle>Voting power</SubSectionTitle>
                    <div className='power-value'>
                      { calcVotingPower(userViewData.stake_active + userViewData.stake_passive,
                        totalsView.stake_active + totalsView.stake_passive) }%
                    </div>
                    <div className='text'>At the epoch beginning</div>
                  </PowerStats>
                }
                <MiddleStats isStake={state === 'stake'}>
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
                { state !== 'stake' ? 
                  <Button className={ButtonLinkClass}
                  onClick={handleStakedInfo}
                  pallete='green'
                  variant='link'>
                    Show staked info
                  </Button> : null }
            </StyledSection>

            { state === 'progress' &&
              <>
                <Separator/>

                <StyledSection>
                    <LeftStatsProgress>
                      { currentProposals.items.length > 0 &&
                      (<>
                        <div className='progress-title'>Your completed proposals</div>                        
                        <div className='progress'>
                            <ProgressBar active={true} percent={
                              (votes / currentProposals.items.length) * 100
                            }/>
                            <span className='progress-percentage'>
                              {parseInt((votes / currentProposals.items.length) * 100 + '')}% ({votes} of {currentProposals.items.length})
                            </span>
                        </div>
                      </>)}
                    </LeftStatsProgress>
                    <MiddleStats isStake={false}>
                        <div className='next-epoch-title'>NEXT EPOCH #{appParams.current.iEpoch + 1}</div>
                        <div className='next-epoch-date'>{nextEpochDate}</div>
                    </MiddleStats>
                    <Button className={ButtonBottomLinkClass}
                    onClick={() => navigate(ROUTES.MAIN.FUTURE_EPOCHS)}
                    pallete='green' variant='link'>Show future proposals</Button>
                </StyledSection>
              </>
            }

            {/* { state === 'stake' &&
              <>
                { withdrawedAmount > 0 && <>
                  <Separator/>
                  <StyledNextEpoch>
                    <div className='title'>Current epoch changes</div>
                    <div className='content'>
                      <LeftStats>
                        <StyledTotalLocked>
                            <SubSectionTitle>Deposit</SubSectionTitle>
                            <SubSectionValue>
                                <IconBeamx/>
                                <span>-</span>
                            </SubSectionValue>
                        </StyledTotalLocked>
                        <StyledStaked>
                            <SubSectionTitle>Withdraw</SubSectionTitle>
                            <SubSectionValue>
                                <IconBeamx/>
                                <span>{ curWithdraw } BEAMX</span>
                            </SubSectionValue>
                        </StyledStaked>
                      </LeftStats>
                      { totalsView.stake_active !== 0 && <PowerStats>
                        <SubSectionTitle>Voting power</SubSectionTitle>
                        <div className='power-value'>
                          { curPowerPercent}%
                          <IconArrowRedDown className='power-up-icon'/>
                        </div>
                      </PowerStats> }
                      <div className='power-add-date'> Voting power decreased in current epoch.</div>
                    </div>
                  </StyledNextEpoch>
                </> }
                { depositedAmount === 0 && 
                <>
                  <Separator/>
                  <StyledIncrease>To increase voting power in next epoch make a deposit.</StyledIncrease>
                </>
                }
                { depositedAmount > 0 && 
                <>
                  <Separator/>
                  <StyledNextEpoch>
                    <div className='title'>Next epoch changes</div>
                    <div className='content'>
                      <LeftStats>
                        <StyledTotalLocked>
                            <SubSectionTitle>Deposit</SubSectionTitle>
                            <SubSectionValue>
                                <IconBeamx/>
                                <span>{numFormatter(fromGroths(depositedAmount))} BEAMX</span>
                            </SubSectionValue>
                        </StyledTotalLocked>
                        <StyledStaked>
                            <SubSectionTitle>Withdraw</SubSectionTitle>
                            <SubSectionValue>
                                <IconBeamx/>
                                <span>{depositedAmount > 0 ? 
                                  numFormatter(fromGroths(withdrawedAmount > depositedAmount ? depositedAmount : 0)) : 
                                  numFormatter(fromGroths(withdrawedAmount))} BEAMX</span>
                            </SubSectionValue>
                        </StyledStaked>
                      </LeftStats>
                      { totalsView.stake_active !== 0 && <PowerStats>
                        <SubSectionTitle>Voting power</SubSectionTitle>
                        <div className='power-value'>
                          { futPowerPercent }%
                          <IconArrowGreenUp className='power-up-icon'/>
                        </div>
                      </PowerStats> }
                      <div className='power-add-date'> Voting power will increase on {nextEpochStartFrom}.</div>
                    </div>
                  </StyledNextEpoch>
                </> }
              </>
            } */}
        </StyledStats>
    );
};

export default EpochStatsSection;
