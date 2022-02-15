import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button } from '@app/shared/components';
import { EpochStatsSection, ProposalsList } from '@app/containers/Main/components';
import { selectCurrentProposals } from '../../store/selectors';

const StatsSectionClass = css`
  margin-bottom: 40px;
`;

const EpochesBase: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentProposals = useSelector(selectCurrentProposals());

  return (
    <Window>
      <EpochStatsSection className={StatsSectionClass} data={true}></EpochStatsSection>
      <ProposalsList title='Proposals' data={currentProposals}></ProposalsList>
    </Window>
  );
};

export default EpochesBase;
