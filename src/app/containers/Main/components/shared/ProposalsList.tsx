import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { IconEpochSelector, IconSearch } from '@app/shared/icons';
import { ProcessedProposal } from '@app/core/types';

interface ListProps {
  data: ProcessedProposal[];
  title: string;
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
    padding: 20px;
    background-color: rgba(255, 255, 255, .05);
    margin-top: 10px;
    border-radius: 10px;
    cursor: pointer;

    > .proposal-id {
        font-size: 12px;
        color: rgba(255, 255, 255, .5);
    }

    > .proposal-title {
        margin-left: 20px;
        font-size: 16px;
    }
`;

const ProposalsList: React.FC<ListProps> = ({ 
  data,
  title,
  isFuture = false
}) => {
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

    const handleListItemClick: React.MouseEventHandler<HTMLLIElement> = ({ currentTarget }) => {

    }

    return data.length > 0 ? (
        <div>
            <ProposalsHeader>
                <PropTitle>{ title }</PropTitle>
                { !isFuture ?
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
            <List>
                {data.map((item, index) => (
                    <ListItem data-index={index} key={index} onClick={handleListItemClick}>
                        <span className='proposal-id'>#{item.id}</span>
                        <span className='proposal-title'>{item.data.title}</span>
                    </ListItem>
                ))}
            </List>
        </div>
    ) : (
        <></>
    );
};

export default ProposalsList;
