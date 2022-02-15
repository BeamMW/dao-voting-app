import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { ClockCircular, ClockCircularExpires } from '@app/shared/icons';
import { ProposalData, SystemState, VotingAppParams } from '@app/core/types';

interface ListProps {
  data: ProposalData[];
  title: string;
}

const ProposalsHeader = styled.div`
    display: flex;
    flex-direction: row;
`;

const PropTitle = styled.span`
    margin-left: 20px;
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 700;
`;

const ProposalsList: React.FC<ListProps> = ({ 
  data,
  title,
}) => {

    return data.length > 0 ? (
        <div>
            <ProposalsHeader>
                <PropTitle>{ title }</PropTitle>
            </ProposalsHeader>
        </div>
    ) : (
        <></>
    );
};

export default ProposalsList;
