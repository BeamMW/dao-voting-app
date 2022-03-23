import React, { useEffect, useState } from 'react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { IconEpochSelector, IconSearch, IconNoProposals } from '@app/shared/icons';
import { ProcessedProposal } from '@app/core/types';
import { useNavigate } from 'react-router-dom';
import { PROPOSALS, ROUTES } from '@app/shared/constants';
import { useSelector } from 'react-redux';
import { selectIsLoaded } from '@app/shared/store/selectors';

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
`;

const StyledItemHeader = styled.div`
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    padding: 20px;
    background-color: rgba(255, 255, 255, .05);
    display: flex;
    flex-direction: row;
    width: 100%;

    > .proposal-id {
        font-size: 12px;
        color: rgba(255, 255, 255, .5);
    }

    > .proposal-title {
        margin-left: 20px;
        font-size: 16px;
        font-weight: 700;
    }
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
    width: 96px;
    height: 19px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 14px;
    padding: 1px 10px;
    font-weight: 400;
    font-size: 14px;
`;

const ProposalsList: React.FC<ListProps> = ({ 
  data,
  title,
  type
}) => {
    const navigate = useNavigate();
    const isLoaded = useSelector(selectIsLoaded());
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

    console.log(data);

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
        { data.length > 0 ?
        (<List>
            {data.map((item, index) => (
                <ListItem data-index={index} key={index} onClick={() => handleListItemClick(item.id, index)}>
                    <StyledItemHeader>
                        <span className='proposal-id'>#{item.id}</span>
                        <span className='proposal-title'>{item.data.title}</span>

                        <PendingVote>pending vote</PendingVote>
                    </StyledItemHeader>
                </ListItem>
            ))}
        </List>) :
        (isLoaded ? <div className={EmptyListClass}>
            <IconNoProposals/>
            <div className='title-class'>There are no proposals</div>
        </div> : null)
        }
    </div>);
};

export default ProposalsList;
