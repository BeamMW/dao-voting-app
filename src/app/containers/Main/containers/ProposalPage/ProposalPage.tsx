import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button, VotingBar } from '@app/shared/components';
import { VoteProposal } from '@core/api';
import { EpochStatsSection, ProposalsList } from '@app/containers/Main/components';
import { selectRate, selectProposal, selectUserView,
  selectCurrentProposals, selectFutureProposals,
  selectAppParams, selectTotalsView } from '../../store/selectors';
import { loadRate } from '@app/containers/Main/store/actions';
import {
  IconVoteButtonNo,
  IconVoteButtonYes,
  IconVotedYes,
  IconVotedNo,
  IconChangeDecision,
  IconExternalLink,
  IconQuorumAlert,
  IconQuorumApprove
} from '@app/shared/icons';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { PROPOSALS, ROUTES } from '@app/shared/constants';
import { fromGroths, getProposalId, toGroths } from '@core/appUtils';
import { ProcessedProposal } from '@app/core/types';
import { openInNewTab } from '@core/appUtils'; 

interface locationProps { 
  id: number,
  type: string,
  index: number
}

interface ProposalContentProps {
  proposal: ProcessedProposal,
  state: locationProps
}

const StatsSectionClass = css`
  margin-bottom: 40px;
`;

const Proposal = styled.div`
  border-radius: 10px;
  width: 100%;
  background-color: rgba(255, 255, 255, .05);
`;

const HeaderStyled = styled.div`
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 20px;
  background-color: rgba(255, 255, 255, .05);
  display: flex;
  flex-direction: row;
  width: 100%;

  > .id-section {
    font-weight: 400;
    color: rgba(255, 255, 255, .5);
  }

  > .middle-section {
    margin-left: 20px;
    line-height: 18px;
    max-width: 85%;
    word-wrap: break-word;

    > .title {
      font-weight: 700;
      font-size: 18px;
    }

    > .forum-link {
      font-weight: 400;
      font-size: 16px;
      color: #00F6D2;
      margin-top: 10px;
      display: flex;
      cursor: pointer;
      align-items: center;

      > .icon-link {
        margin-left: 5px;
        margin-bottom: 2px;
      }
    }
  }

  > .date-section {
    margin-top: 2px;
    margin-left: auto;
    font-size: 12px;
    opacity: .5;
  }
`;

const ContentStyled = styled.div`
  padding: 20px;

  > .controls {
    display: flex;
    margin-bottom: 5px;

    > .button {
      max-width: none
    }

    > .button.no {
      margin-left: 20px;
      color: var(--color-white);
    }
  }

  > .voted-controls {
    width: 100%;
    display: flex;
    margin-bottom: 25px;

    > .change-button {
      margin: 0 0 0 auto;
    }

    > span {
      display: flex;
      align-items: start;
    }

    > span .voted-yes {
      margin-left: 10px;
      color: #00F6D2;
    }

    > span .voted-no {
      margin-left: 10px;
      color: #DE3155;
    }
  }

  > .content {
    display: flex;
    flex-direction: column;

    > .epoch-comes {
      font-weight: 400;
      font-size: 14px;
      font-style: italic;
      opacity: .5;
    }

    > .separator {
      height: 1px;
      width: 100%;
      background-color: rgba(255, 255, 255, 0.1);
      margin: 20px 0;
    }

    > .description {
      font-size: 14px;
      word-wrap: break-word;
    }

    > .stake-info {
      display: flex;
      flex-direction: row;
      margin-top: 20px;

      > .total {
        > .value {
          margin-top: 5px;
          font-weight: 700;
        }
      }

      > .other {
        margin-left: 50px;

        > .value {
          margin-top: 5px;
        }
      }
    }

    > .ref-title {
      margin-top: 20px;
      font-size: 12px;
      opacity: .5;
    }

    > .ref-link {
      font-weight: 700;
      font-size: 14px;
      color: #00F6D2;
      margin-top: 5px;
      display: flex;
      cursor: pointer;
      align-items: center;

    > .icon-link {
      margin-left: 5px;
      margin-bottom: 2px;
    }
  }
`;

const StyledStats = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  align-items: center;

  > .voted,
  > .staked,
  > .quorum,
  > .voted-no {
    margin-left: 20px;
    max-width: 115px;
  }

`;

const StyledStakeTitle = styled.div`
  font-size: 12px;
  opacity: .5;
`;

const StyledHorSeparator = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 20px 0 15px 0;
`;

const StyledStatsValue = styled.div`
  margin-top: 6px;
  font-size: 14px;
`;

const VerticalSeparator = styled.div`
  height: 37px;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 10px 0 35px;
`;

const QuorumIconClass = css`
  margin-left: 5px;
`;

const CurrentProposalContent: React.FC<ProposalContentProps> = (
  {proposal, state}
) => {
  const userViewData = useSelector(selectUserView());
  const currentProposals = useSelector(selectCurrentProposals());
  const totalsView = useSelector(selectTotalsView());
  const [isVoted, setIsVoted] = useState(false);
  const [isQuorumPassed, setQuorumPassed] = useState(false);

  useEffect(() => {
    if (proposal.voted !== undefined && proposal.voted < 255) {
      setIsVoted(true);
    }

    if (proposal.data.quorum !== undefined && 
      (proposal.data.quorum.type === 'beamx' ? proposal.stats.variants[1] >= toGroths(proposal.data.quorum.value) : 
      ((proposal.stats.variants[1] / totalsView.stake_active) * 100 >= proposal.data.quorum.value))) {
        setQuorumPassed(true);
    }
  }, [proposal]);
  
  const handleYesClick = () => {
    let votes = [];

    if (userViewData.current_votes !== undefined) {
      votes = [...userViewData.current_votes];
    } else {
      votes = new Array(currentProposals.items.length).fill(255);
    }
    votes = votes.reverse();
    votes[state.index] = 1;
    VoteProposal(votes);
  };

  const handleNoClick = () => {
    let votes = [];

    if (userViewData.current_votes !== undefined) {
      votes = [...userViewData.current_votes];
    } else {
      votes = new Array(currentProposals.items.length).fill(255);
    }
    votes = votes.reverse();
    votes[state.index] = 0;
    VoteProposal(votes);
  };

  const handleChange = () => {

  };

  return (
    <ContentStyled>
      { proposal.voted === undefined || proposal.voted === 255 ?
        (<div className='controls'>
          <Button variant='regular' pallete='green' onClick={handleYesClick}
            className='button yes' icon={IconVoteButtonYes} >YES</Button>
          <Button variant='regular' pallete='vote-red' onClick={handleNoClick}
            className='button no' icon={IconVoteButtonNo} >NO</Button>
        </div>) :
        (<div className='voted-controls'>
          { proposal.voted === 1 ? 
            (<span>
              <IconVotedYes/>
              <span className='voted-yes'>You voted YES</span>
            </span>) : 
            (<span>
              <IconVotedNo/>
              <span className='voted-no'>You voted NO</span>
            </span>)
          }
          <Button pallete='white'
            className='change-button'
            onClick={handleChange}
            variant='link'
            icon={IconChangeDecision}>
                change decision
          </Button>
        </div>)
      }
      <VotingBar active={proposal.voted !== undefined && proposal.voted < 255}
        quorum={proposal.data.quorum !== undefined ? 
          (proposal.data.quorum.type === 'beamx' ? 
            ((proposal.data.quorum.value / totalsView.stake_active) * 100)  : proposal.data.quorum.value ) : null}
        qType={proposal.data.quorum.type}
        value={proposal.stats.variants[1]}
        percent={proposal.stats.variants[1] / proposal.stats.total * 100}
        voteType='yes'/>
      <VotingBar active={proposal.voted !== undefined && proposal.voted < 255}
        value={proposal.stats.variants[0]}
        percent={proposal.stats.variants[0] / proposal.stats.total * 100}
        voteType='no'/>
      <StyledStats>
        <span className='total'>
          <StyledStakeTitle>Total staked</StyledStakeTitle>
          <StyledStatsValue>{fromGroths(totalsView.stake_active)} BEAMX</StyledStatsValue>
        </span>
        {
          isVoted &&
          <span className='voted'>
            <StyledStakeTitle>Voted</StyledStakeTitle>
            <StyledStatsValue>{fromGroths(proposal.stats.total)} BEAMX</StyledStatsValue>
          </span>
        }
        <span className='staked'>
          <StyledStakeTitle>Your staked</StyledStakeTitle>
          <StyledStatsValue>{fromGroths(userViewData.stake_active)} BEAMX</StyledStatsValue>
        </span>
        {
          proposal.data.quorum !== undefined && 
          <span className='quorum'>
            <StyledStakeTitle>Quorum</StyledStakeTitle>
            <StyledStatsValue>
              { proposal.data.quorum.value + (proposal.data.quorum.type === 'beamx' ? ' BEAMX' : '%') }
              { isQuorumPassed ? <IconQuorumApprove className={QuorumIconClass}/> : <IconQuorumAlert className={QuorumIconClass}/>}
            </StyledStatsValue>
          </span>
        }
        {
          isVoted && <>
            <VerticalSeparator/>
            <span className='voted-yes'>
              <StyledStakeTitle>Voted YES</StyledStakeTitle>
              <StyledStatsValue>{fromGroths(proposal.stats.variants[1])}</StyledStatsValue>
            </span>
            <span className='voted-no'>
              <StyledStakeTitle>Voted NO</StyledStakeTitle>
              <StyledStatsValue>{fromGroths(proposal.stats.variants[0])}</StyledStatsValue>
            </span>
          </>
        }
      </StyledStats>
      <StyledHorSeparator/>
      <div className='content'>
        <div className='description'>{proposal.data.description}</div>
        {
          proposal.data.ref_link.length > 0 && 
          <>
            <div className='ref-title'>References</div>
            <div className='ref-link' onClick={() => {openInNewTab(proposal.data.forum_link)}}>
                <span>{proposal.data.ref_link}</span>
                <IconExternalLink className='icon-link'/>
            </div>
          </>
        }
      </div>
    </ContentStyled>
  );
};

const FutureProposalContent: React.FC<ProposalContentProps> = (
  {proposal, state}
) => {
  const appParams = useSelector(selectAppParams());
  const userViewData = useSelector(selectUserView());
  const totalsView = useSelector(selectTotalsView());

  return (
    <ContentStyled>
      { proposal.data &&
        <div className='content'>
          <div className='epoch-comes'>The voting will be active when epoch #{appParams.current.iEpoch + 1} comes.</div>
          <div className='stake-info'>
            <span className='total'>
              <StyledStakeTitle>Total staked</StyledStakeTitle>
              <div className='value'>{fromGroths(totalsView.stake_passive + totalsView.stake_active)} BEAMX</div>
            </span>
            <span className='other'>
              <StyledStakeTitle>Your staked</StyledStakeTitle>
              <div className='value'>{fromGroths(userViewData.stake_passive + userViewData.stake_active)} BEAMX</div>
            </span>
            { 
              proposal.data.quorum !== undefined && proposal.data.quorum.type === 'percent' &&
              <span className='other'>
                <StyledStakeTitle>Votes quorum</StyledStakeTitle>
                <div className='value'>{proposal.data.quorum.value} %</div>
              </span>
            }
          </div>
          <div className='separator'></div>
          <div className='description'>{proposal.data.description}</div>
          {
            proposal.data.ref_link.length > 0 && 
            <>
              <div className='ref-title'>References</div>
              <div className='ref-link' onClick={() => {openInNewTab(proposal.data.forum_link)}}>
                  <span>{proposal.data.ref_link}</span>
                  <IconExternalLink className='icon-link'/>
              </div>
            </>
          }
        </div>
      }
    </ContentStyled>
  );
}

const ProposalPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rate = useSelector(selectRate());
  const location = useLocation();

  useEffect(() => {
    if (!rate) {
      dispatch(loadRate.request());
    }
  }, [dispatch, rate]);

  const params = useParams();
  const state = location.state as locationProps;
  const proposal = useSelector(selectProposal(state.id, state.type));
  
  const handlePrevious: React.MouseEventHandler = () => {
    if (state.type === PROPOSALS.CURRENT) {
      navigate(ROUTES.MAIN.EPOCHS);
    } else if (state.type === PROPOSALS.FUTURE) {
      navigate(ROUTES.MAIN.FUTURE_EPOCHS);
    } else if (state.type === PROPOSALS.PREV) {
      navigate(ROUTES.MAIN.PREVIOUS_EPOCHS);
    }
  };

  const ContentComponent = {
    current: CurrentProposalContent,
    future: FutureProposalContent
  }[state.type];

  const getDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const yearString = date.toLocaleDateString(undefined, { year: 'numeric' });
    const monthString = date.toLocaleDateString(undefined, { month: 'numeric' });
    const dayString = date.toLocaleDateString(undefined, { day: 'numeric' });
    return `${dayString}.${'0' + monthString.slice(-2)}.${yearString}`;
  };

  return (
    <>
      <Window onPrevious={handlePrevious}>
        <EpochStatsSection
          state='none'
          className={StatsSectionClass}></EpochStatsSection>
        <Proposal>
          <HeaderStyled>
            <div className='id-section'>#{getProposalId(proposal.id)}</div>
            <div className='middle-section'>
              <div className='title'>{proposal.data.title}</div>
              <div className='forum-link' onClick={() => {openInNewTab(proposal.data.forum_link)}}>
                <span>Open forum discussion</span>
                <IconExternalLink className='icon-link'/>
              </div>
            </div>
            { proposal.data.timestamp ? <div className='date-section'>
              {getDate(proposal.data.timestamp)}
            </div> : null }
          </HeaderStyled>
          <ContentComponent proposal={proposal} state={state}/>
        </Proposal>
      </Window>
    </>
  );
};

export default ProposalPage;
