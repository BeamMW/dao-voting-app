import React, { useEffect, useState } from 'react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { IconEpochSelector, IconSearch, IconNoProposals, IconVotedYes, IconVotedNo } from '@app/shared/icons';
import { ProcessedProposal } from '@app/core/types';
import { useNavigate } from 'react-router-dom';
import { PROPOSALS, ROUTES } from '@app/shared/constants';
import { useSelector } from 'react-redux';
import { selectIsLoaded } from '@app/shared/store/selectors';
import { fromGroths } from '@core/appUtils';
import { selectAppParams } from '../../store/selectors';
import { getProposalId } from '@core/appUtils';

interface ListProps {
  data: ProcessedProposal[];
  title: string;
  type: string;
  isFuture?: boolean;
}

const ProposalsHeader = styled.div`
    display: flex;
    flex-direction: row;

    > .icon-search-class {
        margin-left: auto;
        cursor: pointer;
    }

    > .selector-class {
        margin-left: 34px;
        font-size: 12px;
    }
`;

const List = styled.ul`
    display: flex;
    flex-direction: column;
`;

const PropTitle = styled.span`
    margin-left: 20px;
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 3.11111px;
`;

const SelectorItem = styled.span<{ active: boolean }>`
    padding: 4px 16px;
    border-bottom: ${({ active }) => (active ? '2px solid #00F6D2' : 'none')};
    cursor: ${({ active }) => (active ? 'default' : 'pointer')};
    color: ${({ active }) => (active ? 'var(--color-white)' : 'rgba(255, 255, 255, .3)')};
`;

const EpochSelector = styled.span`
    margin-left: 30px;

    > .epoches-selector-title {
        font-size: 14px;
        color: rgba(255, 255, 255, .5);
    }

    > .epoches-selected-item {
        margin-left: 10px;
        font-size: 14px;
        font-weigth: 700;
        color: rgba(255, 255, 255, .7);
    }

    > .epoches-selector-icon {
        margin-left: 10px;
    }
`;

const ListItem = styled.li`
    background-color: rgba(255, 255, 255, .05);
    margin-top: 10px;
    border-radius: 10px;
    cursor: pointer;
    overflow: hidden;

    > .voted {
        background-color: rgba(255, 255, 255, .05);
    }
`;

const StyledItemHeader = styled.div`
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;

    > .proposal-id {
        font-size: 12px;
        color: rgba(255, 255, 255, .5);
    }

    > .proposal-title {
        padding-right: 10px;
        margin-left: 20px;
        font-size: 16px;
        font-weight: 700;
    }
`;

const StyledItemContent = styled.div`
    display: flex;
    align-items: center;
    width: 100%
    padding: 10px 20px 20px 75px;

    > .voted-no {
        margin-left: 50px;
    }
    
    > .voted-icon {
        margin-top: 15px;
        margin-left: auto;
    }
`;

const StyledVotedTitle = styled.div`
    font-weight: 400;
    font-size: 12px;
    color: rgba(255, 255, 255, .5);
`;

const StyledVotedValue = styled.div`
    margin-top: 5px;
    font-weight: 400;
    font-size: 14px;
`;

const EmptyListClass = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 80px;

    > .title-class {
        margin-top: 30px;
        font-size: 14px;
        color: rgba(255, 255, 255, .5);
    }
`;

const PendingVote = styled.div`
    margin-left: auto;
    height: 19px;
    min-width: 120px;
    text-align: center;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 14px;
    padding: 1px 10px;
    font-weight: 400;
    font-size: 14px;
`;

const StyledEpochTitle = styled.div`
    font-weight: 700;
    font-size: 14px;
    color: rgba(255, 255, 255, .5);
    text-transform: uppercase;
    letter-spacing: 3.11px;
    margin-top: 20px;
    margin-bottom: 10px;
`;

const ProposalsList: React.FC<ListProps> = ({ 
  data,
  title,
  type
}) => {
    const navigate = useNavigate();
    const isLoaded = useSelector(selectIsLoaded());
    const appParams = useSelector(selectAppParams());
    const selectorData = [
        {
            id: 0,
            title: 'ALL'
        },
        {
            id: 1,
            title: 'AWAITING YOUR VOTE'
        },
        {
            id: 3,
            title: 'YOUR VOTES'
        }
    ];

    const [selectorActiveItem, setSelectorItem] = useState(selectorData[0]);
    const handleSelectorClick: React.MouseEventHandler<HTMLLIElement> = ({ currentTarget }) => {
        setSelectorItem(selectorData[currentTarget.dataset.index]);
    };
    
    const handleSearchClick = () => {

    };

    const handleListItemClick = (id: number, index: number) => {
        navigate(ROUTES.MAIN.PROPOSAL_PAGE, {state: {id, type, index}});
    }

    return (<div>
        <ProposalsHeader>
            <PropTitle>{ title }</PropTitle>
            { type === PROPOSALS.CURRENT ?
            (<div className='selector-class'>
                {selectorData.map((item, index) => (
                    <SelectorItem key={index} active={selectorActiveItem.id === item.id} 
                    data-index={index} onClick={handleSelectorClick}>
                        {item.title}
                    </SelectorItem>
                ))}
            </div>) : null}
            <IconSearch className='icon-search-class' onClick={handleSearchClick}/>
            <EpochSelector>
                <span className='epoches-selector-title'>Epoch</span>
                <span className='epoches-selected-item'>#22</span>
                <IconEpochSelector className='epoches-selector-icon'/>
            </EpochSelector>
        </ProposalsHeader>

        { type === PROPOSALS.CURRENT ? <StyledEpochTitle>
            Epoch #{appParams.current.iEpoch} (current)
        </StyledEpochTitle> : null}

        { data.length > 0 ?
        (<List>
            { data.map((item, index) =>
                !!item.data && <ListItem data-index={index} key={index} onClick={() => handleListItemClick(item.id, index)}>
                    <StyledItemHeader className={item.voted !== undefined && item.voted < 255 ? 'voted' : ''}>
                        <span className='proposal-id'>#{getProposalId(item.id)}</span>
                        <span className='proposal-title'>{item.data.title}</span>

                        { type === PROPOSALS.CURRENT && (item.voted === undefined || item.voted !== undefined && item.voted == 255) ? 
                            <PendingVote>pending vote</PendingVote> : null}
                    </StyledItemHeader>
                    { type === PROPOSALS.CURRENT && item.voted !== undefined && item.voted < 255 ? (<StyledItemContent>
                        <span className='voted-yes'>
                            <StyledVotedTitle>Voted YES</StyledVotedTitle>
                            <StyledVotedValue>{fromGroths(item.stats.variants[1])} BEAMX</StyledVotedValue>
                        </span>
                        <span className='voted-no'>
                            <StyledVotedTitle>Voted NO</StyledVotedTitle>
                            <StyledVotedValue>{fromGroths(item.stats.variants[0])} BEAMX</StyledVotedValue>
                        </span>
                        <span className='voted-icon'>
                            { item.voted !== undefined && item.voted === 1 ? <IconVotedYes/> : <IconVotedNo/> }
                        </span>
                    </StyledItemContent>) : null}
                </ListItem>
            )}
        </List>) :
        (isLoaded ? <div className={EmptyListClass}>
            <IconNoProposals/>
            <div className='title-class'>There are no proposals</div>
        </div> : null)
        }
    </div>);
};

export default ProposalsList;
