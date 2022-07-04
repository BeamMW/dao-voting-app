import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button, VotingBar, ChangeDecisionPopup } from '@app/shared/components';
import { VoteProposal } from '@core/api';
import { EpochStatsSection, ProposalsList } from '@app/containers/Main/components';
import { selectRate, selectProposal, selectUserView,
  selectCurrentProposals, selectFutureProposals,
  selectAppParams, selectTotalsView, selectVoteCounter } from '../../store/selectors';
import { loadRate, setLocalVoteCounter } from '@app/containers/Main/store/actions';
import { Popover } from 'react-tiny-popover';
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
import { PROPOSALS, ROUTES, BEAMX_TVL } from '@app/shared/constants';
import { fromGroths, getProposalId, toGroths, numFormatter, calcVotingPower } from '@core/appUtils';
import { ProcessedProposal } from '@app/core/types';
import { openInNewTab } from '@core/appUtils'; 
import { selectTransactions } from '@app/shared/store/selectors';
import ReactMarkdown from 'react-markdown';


interface locationProps { 
  id: number,
  type: string,
  index: number
}

interface ProposalContentProps {
  proposal: ProcessedProposal,
  state: locationProps,
  callback?: any,
  isChangeProcessActive?: boolean,
  onDisableChangeProcessState?: ()=>void
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

  > .voted-finished {
    font-style: italic;
    font-size: 14px;
    opacity: 0.5;
    margin-bottom: 25px;
  }

  > .voted-controls {
    width: 100%;
    display: flex;
    margin-bottom: 25px;

    > .change-button {
      margin: 0 0 0 auto;
    }

    > .voted-cant {
      font-style: italic;
      opacity: 0.5;
      margin-left: auto;
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

      ul {
        padding-left: 40px;
      }

      table, th, td {
        border: 1px grey solid;
      }

      table {
        margin: 10px 0;
      }

      th, td {
        padding: 5px 10px;
      }

      code {
        border: 1px solid;
        padding: 1px 5px;
      }

      pre {
        border: 1px solid;
        padding: 1px 5px;
      }

      pre code {
        border: none;
      }
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
  align-items: start;

  > .voted,
  > .staked,
  > .quorum {
    margin-left: 60px;
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

  > .yes {
    font-weight: 700;
  }

  > .no {
    margin-left: 20px;
    font-weight: 700;
  }
`;

const StyledPopover = styled.div`
  padding: 15px;
  background: rgb(66, 89, 112);
  border-radius: 5px;
  margin-bottom: 9px;
  margin-left: 60px;

  :after {
    content: '';
    position: absolute;
    margin-left: 30px;
    left: 47%;
    top: 45px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid rgba(66, 89, 112, 1);
    clear: both;
  }
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
  {proposal, state, callback, isChangeProcessActive, onDisableChangeProcessState}
) => {
  const dispatch = useDispatch();
  const userViewData = useSelector(selectUserView());
  const currentProposals = useSelector(selectCurrentProposals());
  const voteCounter = useSelector(selectVoteCounter());
  const totalsView = useSelector(selectTotalsView());
  const [isVoted, setIsVoted] = useState(false);
  const [isQuorumPassed, setQuorumPassed] = useState(false);
  const transactions = useSelector(selectTransactions());
  const [isVoteInProgress, setVoteInProgress] = useState(false);
  const [isPopoverOpen, setPopoverState] = useState(false);

  useEffect(() => {
    if (proposal.voted !== undefined && proposal.voted < 255) {
      setIsVoted(true);
    }

    if (proposal.data.quorum !== undefined && 
      (proposal.data.quorum.type === 'beamx' ? proposal.stats.result.variants[1] >= toGroths(proposal.data.quorum.value) : 
      ((fromGroths(proposal.stats.result.variants[1]) / BEAMX_TVL) * 100 >= proposal.data.quorum.value))) {
        setQuorumPassed(true);
    }

    const activeVotes = localStorage.getItem('votes');
    
    if (activeVotes) {
      const votes = [...(JSON.parse(activeVotes).votes)];

      const currentProposal = votes.find((item) => {
        return item.id === proposal.id;
      });

      if (currentProposal) {
        const isInProgress = transactions.find((tx) => {
          return tx.txId === currentProposal.txid && tx.status === 5;
        });

        setVoteInProgress(!!isInProgress);
        
        if (!isInProgress) {
          const updatedVotes = votes.filter(function(item){ 
            return item.id !== proposal.id;
          });

          localStorage.setItem('votes', JSON.stringify({votes: updatedVotes}));
        }
      }
    }
  }, [proposal]);
  
  const handleVoteClick = (vote: number) => {
    let votes = userViewData.current_votes !== undefined ? [...userViewData.current_votes] : 
      new Array(currentProposals.items.length).fill(255);

    const index = currentProposals.items.indexOf(proposal);
    votes[index] = vote;

    const activeVotes = localStorage.getItem('votes');
    
    if (activeVotes) {
      const votesInProgress = [...(JSON.parse(activeVotes).votes)];
        
      let index = 0;
      for (let voteInProgress of [...votesInProgress]) {
        const voteTransaction = transactions.find((tx) => {
          return tx.txId === voteInProgress.txid && tx.status === 5;
        })

        if (!voteTransaction) {
          votesInProgress.splice(index, 1);
        } else {
          const voteItem = currentProposals.items.find((item) => {
            return item.id === voteInProgress.id;
          });
  
          if (voteItem) {
            const voteIndex = currentProposals.items.indexOf(voteItem);
            votes[voteIndex] = voteInProgress.vote;
          }
        }
      }

      localStorage.setItem('votes', JSON.stringify({votes: votesInProgress}));
    }

    const counter = voteCounter + 1;
    dispatch(setLocalVoteCounter(counter));
    VoteProposal(votes, proposal.id, vote, counter);
    onDisableChangeProcessState();
  };

  const handleChange = () => {
    callback();
  };

  return (
    <ContentStyled>
      { isChangeProcessActive || (proposal.voted === undefined || proposal.voted === 255) ?
        (<div className='controls'>
          <Button variant='regular' pallete='green' onClick={()=>handleVoteClick(1)}
            disabled={isVoteInProgress || userViewData.stake_active === 0}
            className='button yes' icon={IconVoteButtonYes} >YES</Button>
          <Button variant='regular' pallete='vote-red' onClick={()=>handleVoteClick(0)}
            disabled={isVoteInProgress || userViewData.stake_active === 0}
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
        value={proposal.stats.result.variants[1]}
        percent={proposal.stats.result.variants[1] / proposal.stats.result.total * 100}
        voteType='yes'/>
      <VotingBar active={proposal.voted !== undefined && proposal.voted < 255}
        value={proposal.stats.result.variants[0]}
        percent={proposal.stats.result.variants[0] / proposal.stats.result.total * 100}
        voteType='no'/>
      <StyledStats>
        <span className='total'>
          <StyledStakeTitle>Total staked</StyledStakeTitle>
          <StyledStatsValue>{numFormatter(fromGroths(totalsView.stake_active))} BEAMX</StyledStatsValue>
        </span>
        <span className='voted'>
            <StyledStakeTitle>Voted</StyledStakeTitle>
            <StyledStatsValue>{numFormatter(fromGroths(proposal.stats.result.total))} BEAMX</StyledStatsValue>
        </span>
        <span className='staked'>
          <StyledStakeTitle>Your staked</StyledStakeTitle>
          <StyledStatsValue>{numFormatter(fromGroths(userViewData.stake_active))} BEAMX</StyledStatsValue>
        </span>
        {
          proposal.data.quorum !== undefined && 
          <span className='quorum'>
            <StyledStakeTitle>Quorum</StyledStakeTitle>
            <Popover
              isOpen={isPopoverOpen}
              positions={['top', 'bottom', 'left', 'right']}
              content={
                <StyledPopover>
                  {proposal.data.quorum.type === 'percent' ? 
                    numFormatter(BEAMX_TVL * (proposal.data.quorum.value / 100)) :
                    numFormatter(proposal.data.quorum.value)} BEAMX votes «YES» needed 
                </StyledPopover>
              }
            >
              <StyledStatsValue>
                { proposal.data.quorum.type === 'beamx' ? 
                  (numFormatter(proposal.data.quorum.value) + ' BEAMX') :
                  (proposal.data.quorum.value + '%') }
                { 
                  isQuorumPassed ? 
                  <IconQuorumApprove className={QuorumIconClass}/> : 
                  <IconQuorumAlert className={QuorumIconClass}
                    onMouseEnter={()=>setPopoverState(true)}
                    onMouseLeave={()=>setPopoverState(false)}/>
                }
              </StyledStatsValue>
            </Popover>
          </span>
        }
        {proposal.stats.result.total > 0 &&
          <>
            <VerticalSeparator/>
            <span className='voted-yes'>
              <StyledStakeTitle>Voting results</StyledStakeTitle>
              <StyledStatsValue>
                <span className='yes'>YES</span> ({calcVotingPower(proposal.stats.result.variants[1], proposal.stats.result.total)}%)
                <span className='no'>NO</span> ({calcVotingPower(proposal.stats.result.variants[0], proposal.stats.result.total)}%)
              </StyledStatsValue>
            </span>
          </> 
        }
      </StyledStats>
      <StyledHorSeparator/>
      <div className='content'>
        <div className='description'>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({node, ...props}) => <span style={{display: 'inline-flex', alignItems: 'center'}}><a target="_blank" style={{
                color: '#00F6D2', 
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
                lineHeight: '15px'
              }} {...props} /> 
              <IconExternalLink style={{marginLeft: '5px'}} className='icon-link'/></span>
            }}
          >{proposal.data.description}</ReactMarkdown>
        </div>
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

const PrevProposalContent: React.FC<ProposalContentProps> = (
  {proposal, state, callback, isChangeProcessActive, onDisableChangeProcessState}
) => {
  const userViewData = useSelector(selectUserView());
  const totalsView = useSelector(selectTotalsView());
  const [isVoted, setIsVoted] = useState(false);
  const [isQuorumPassed, setQuorumPassed] = useState(false);
  const transactions = useSelector(selectTransactions());
  const [isVoteInProgress, setVoteInProgress] = useState(false);
  const [isPopoverOpen, setPopoverState] = useState(false);

  useEffect(() => {
    if (proposal.voted !== undefined && proposal.voted < 255) {
      setIsVoted(true);
    }

    if (proposal.data.quorum !== undefined && 
      (proposal.data.quorum.type === 'beamx' ? (proposal.stats.result.variants[1] >= toGroths(proposal.data.quorum.value)) : 
      ((fromGroths(proposal.stats.result.variants[1]) / BEAMX_TVL) * 100 >= proposal.data.quorum.value))) {
        setQuorumPassed(true);
    }

    const activeVotes = localStorage.getItem('votes');
    
    if (activeVotes) {
      const votes = [...(JSON.parse(activeVotes).votes)];

      const currentProposal = votes.find((item) => {
        return item.id === proposal.id;
      });

      if (currentProposal) {
        const isInProgress = transactions.find((tx) => {
          return tx.txId === currentProposal.txid && tx.status === 5;
        });

        setVoteInProgress(!!isInProgress);
        
        // if (!isInProgress) {
        //   const updatedVotes = votes.filter(function(item){ 
        //     return item.id !== proposal.id;
        //   });

        //   localStorage.setItem('votes', JSON.stringify({votes: updatedVotes}));
        // }
      }
    }
  }, [proposal]);

  return (
    <ContentStyled>
      { proposal.prevVoted && proposal.prevVoted.value < 255 ?
      <div className='voted-controls'>
          { proposal.prevVoted.value === 1 ? 
            (<span>
              <IconVotedYes/>
              <span className='voted-yes'>You voted YES</span>
            </span>) : 
            (<span>
              <IconVotedNo/>
              <span className='voted-no'>You voted NO</span>
            </span>)
          }
          <div className='voted-cant'>The epoch #{proposal.epoch} is finished. You can’t change your decision.</div>
      </div> : 
      <div className='voted-finished'>
        The epoch #{proposal.epoch} is finished. You hadn’t voted.
      </div>
      }
      <VotingBar active={proposal.prevVoted && proposal.prevVoted.value < 255}
        value={proposal.stats.result.variants[1]}
        percent={proposal.stats.result.variants[1] / proposal.stats.result.total * 100}
        voteType='yes'/>
      <VotingBar active={proposal.prevVoted && proposal.prevVoted.value < 255}
        value={proposal.stats.result.variants[0]}
        percent={proposal.stats.result.variants[0] / proposal.stats.result.total * 100}
        voteType='no'/>
      <StyledStats>
        <span className='total'>
          <StyledStakeTitle>Total staked</StyledStakeTitle>
          <StyledStatsValue>{numFormatter(fromGroths(proposal.stats.result.stake_active))} BEAMX</StyledStatsValue>
        </span>
       <span className='voted'>
            <StyledStakeTitle>Voted</StyledStakeTitle>
            <StyledStatsValue>{numFormatter(fromGroths(proposal.stats.result.total))} BEAMX</StyledStatsValue>
        </span>
        { proposal.prevVoted &&
        <span className='staked'>
          <StyledStakeTitle>Your staked</StyledStakeTitle>
          <StyledStatsValue>{numFormatter(fromGroths(proposal.prevVoted.stake))} BEAMX</StyledStatsValue>
        </span>}
        {
          proposal.data.quorum !== undefined && 
          <span className='quorum'>
            <StyledStakeTitle>Quorum</StyledStakeTitle>
            <Popover
              isOpen={isPopoverOpen}
              positions={['top', 'bottom', 'left', 'right']}
              content={
                <StyledPopover>
                  {proposal.data.quorum.type === 'percent' ? 
                    numFormatter(BEAMX_TVL * (proposal.data.quorum.value / 100)) :
                    numFormatter(proposal.data.quorum.value)} BEAMX votes «YES» needed 
                </StyledPopover>
              }
            >
              <StyledStatsValue>
                { proposal.data.quorum.type === 'beamx' ? 
                  (numFormatter(proposal.data.quorum.value) + ' BEAMX') :
                  (proposal.data.quorum.value + '%') }
                { 
                  isQuorumPassed ? 
                  <IconQuorumApprove className={QuorumIconClass}/> : 
                  <IconQuorumAlert className={QuorumIconClass}
                    onMouseEnter={()=>setPopoverState(true)}
                    onMouseLeave={()=>setPopoverState(false)}/>
                }
              </StyledStatsValue>
            </Popover>
          </span>
        }
        {proposal.stats.result.total > 0 &&
          <>
            <VerticalSeparator/>
            <span className='voted-yes'>
              <StyledStakeTitle>Voting results</StyledStakeTitle>
              <StyledStatsValue>
                <span className='yes'>YES</span> ({calcVotingPower(proposal.stats.result.variants[1], proposal.stats.result.total)}%)
                <span className='no'>NO</span> ({calcVotingPower(proposal.stats.result.variants[0], proposal.stats.result.total)}%)
              </StyledStatsValue>
            </span>
          </> 
        }
      </StyledStats>
      <StyledHorSeparator/>
      <div className='content'>
        <div className='description'>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({node, ...props}) => <span style={{display: 'inline-flex', alignItems: 'center'}}><a target="_blank" style={{
                color: '#00F6D2', 
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
                lineHeight: '15px'
              }} {...props} /> 
              <IconExternalLink style={{marginLeft: '5px'}} className='icon-link'/></span>
            }}
          >{proposal.data.description}</ReactMarkdown>
        </div>
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
              <div className='value'>
                {numFormatter(fromGroths(totalsView.stake_passive + totalsView.stake_active))} BEAMX
              </div>
            </span>
            <span className='other'>
              <StyledStakeTitle>Your staked</StyledStakeTitle>
              <div className='value'>
                {numFormatter(fromGroths(userViewData.stake_passive + userViewData.stake_active))} BEAMX
              </div>
            </span>
            { 
              proposal.data.quorum !== undefined &&
              <span className='other'>
                <StyledStakeTitle>Votes quorum</StyledStakeTitle>
                <div className='value'>
                  { proposal.data.quorum.type === 'percent' ? 
                    (proposal.data.quorum.value + '%') :
                    (numFormatter(proposal.data.quorum.value) + ' BEAMX') }
                </div>
              </span>
            }
          </div>
          <div className='separator'></div>
          <div className='description'>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({node, ...props}) => <span style={{display: 'inline-flex', alignItems: 'center'}}><a target="_blank" style={{
                  color: '#00F6D2', 
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  lineHeight: '15px'
                }} {...props} /> 
                <IconExternalLink style={{marginLeft: '5px'}} className='icon-link'/></span>
              }}
            >{proposal.data.description}</ReactMarkdown>
          </div>
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
  const [isChangeVisible, setChangePopupState] = useState(false);
  const [isChangeActive, setChangeProcessState] = useState(false);

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
    future: FutureProposalContent,
    prev: PrevProposalContent
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
          <ContentComponent isChangeProcessActive={isChangeActive}
            onDisableChangeProcessState={()=>setChangeProcessState(false)}
            callback={()=>{setChangePopupState(true)}} proposal={proposal} state={state}/>
        </Proposal>
      </Window>
      <ChangeDecisionPopup voted={proposal.voted !== undefined ? proposal.voted : null}
        onChangeResult={(res)=>{setChangeProcessState(res)}}
        propTitle={proposal.data.title}
        visible={isChangeVisible} onCancel={()=>{setChangePopupState(false)}}/>
    </>
  );
};

export default ProposalPage;
