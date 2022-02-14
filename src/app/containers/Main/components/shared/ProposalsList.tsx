import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { ClockCircular, ClockCircularExpires } from '@app/shared/icons';
import { SystemState, VotingAppParams } from '@app/core/types';

interface SitesProps {
  data: boolean;
}

const ProposalsList: React.FC<SitesProps> = ({ 
  data,
}) => {

    return data ? (
        <div>
            <div>123</div>
            <div>2345</div>
        </div>
    ) : (
        <></>
    );
};

export default ProposalsList;
