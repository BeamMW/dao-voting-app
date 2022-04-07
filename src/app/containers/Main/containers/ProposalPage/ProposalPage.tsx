import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button } from '@app/shared/components';
import { VoteProposal } from '@core/api';
import { EpochStatsSection, ProposalsList } from '@app/containers/Main/components';
import { selectRate, selectProposal, selectUserView, selectCurrentProposals, selectFutureProposals, selectAppParams, selectTotalsView } from '../../store/selectors';
import { loadRate } from '@app/containers/Main/store/actions';
import {
  IconVoteButtonNo,
  IconVoteButtonYes,
  IconVotedYes,
  IconVotedNo,
  IconChangeDecision,
  IconExternalLink
} from '@app/shared/icons';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { PROPOSALS, ROUTES } from '@app/shared/constants';
import { fromGroths, getProposalId } from '@core/appUtils';
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

  > .future-content {
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

const StyledStakeTitle = styled.div`
  font-size: 12px;
  opacity: .5;
`;

const CurrentProposalContent: React.FC<ProposalContentProps> = (
  {proposal, state}
) => {
  const userViewData = useSelector(selectUserView());
  const currentProposals = useSelector(selectCurrentProposals());
  
  const handleYesClick = () => {
    let votes = [];

    if (userViewData.current_votes !== undefined) {
      votes = [...userViewData.current_votes];
    } else {
      votes = new Array(currentProposals.items.length).fill(255);
    }
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
      { proposal.data ?
        <div className='future-content'>
          <div className='epoch-comes'>The voting will be active when epoch #{appParams.current.iEpoch + 1} comes.</div>
          <div className='stake-info'>
            <span className='total'>
              <StyledStakeTitle>Total staked</StyledStakeTitle>
              <div className='value'>{fromGroths(totalsView.stake_passive)} BEAMX</div>
            </span>
            <span className='other'>
              <StyledStakeTitle>Your staked</StyledStakeTitle>
              <div className='value'>{fromGroths(userViewData.stake_passive)} BEAMX</div>
            </span>
            { proposal.data.quorum !== undefined && proposal.data.quorum.type === 'percent' ?
            <span className='other'>
              <StyledStakeTitle>Votes quorum</StyledStakeTitle>
              <div className='value'>{proposal.data.quorum.value} %</div>
            </span> : null }
          </div>
          <div className='separator'></div>
          <div className='description'>{proposal.data.description}</div>
          {
            proposal.data.ref_link.length > 0 ? 
            <>
              <div className='ref-title'>References</div>
              <div className='ref-link' onClick={() => {openInNewTab(proposal.data.forum_link)}}>
                  <span>{proposal.data.ref_link}</span>
                  <IconExternalLink className='icon-link'/>
              </div>
            </> : null
          }
        </div> :
        null
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
