import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button } from '@app/shared/components';
import { VoteProposal } from '@core/api';
import { EpochStatsSection, ProposalsList } from '@app/containers/Main/components';
import { selectRate, selectProposal, selectUserView, selectCurrentProposals } from '../../store/selectors';
import { loadRate } from '@app/containers/Main/store/actions';
import {
  IconVoteButtonNo,
  IconVoteButtonYes,
  IconVotedYes,
  IconVotedNo,
  IconChangeDecision,
} from '@app/shared/icons';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { PROPOSALS, ROUTES } from '@app/shared/constants';

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

    > .title {
      font-weight: 700;
      font-size: 18px;
    }

    > .forum-link {
      font-weight: 400;
      font-size: 16px;
      color: #00F6D2;
      margin-top: 10px;
      cursor: pointer;
    }
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
`;

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
  const state = location.state as { id: number, type: string, index: number};
  const proposal = useSelector(selectProposal(state.id, state.type));
  const userViewData = useSelector(selectUserView());
  const currentProposals = useSelector(selectCurrentProposals());
  console.log(proposal)

  const handlePrevious: React.MouseEventHandler = () => {
    if (state.type === PROPOSALS.CURRENT) {
      navigate(ROUTES.MAIN.EPOCHS);
    }
  };

  const openInNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  };

  const handleYesClick = () => {
    let votes = [];

    if (userViewData.current_votes !== undefined) {
      votes = userViewData.current_votes;
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
    <>
      <Window onPrevious={handlePrevious}>
        <EpochStatsSection
          isWithProgress={false}
          className={StatsSectionClass} data={true}></EpochStatsSection>
        <Proposal>
          <HeaderStyled>
            <div className='id-section'>#{proposal.id}</div>
            <div className='middle-section'>
              <div className='title'>{proposal.data.title}</div>
              <div className='forum-link' onClick={() => {openInNewTab(proposal.data.forum_link)}}>Open forum discussion</div>
            </div>
          </HeaderStyled>
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
              </div>)}
          </ContentStyled>
        </Proposal>
      </Window>
    </>
  );
};

export default ProposalPage;
