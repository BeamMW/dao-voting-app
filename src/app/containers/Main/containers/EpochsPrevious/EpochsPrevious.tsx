import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button } from '@app/shared/components';
import { EpochStatsSection, ProposalsList } from '@app/containers/Main/components';
import { selectFutureProposals } from '../../store/selectors';
import { PROPOSALS, ROUTES } from '@app/shared/constants';

const StatsSectionClass = css`
  margin-bottom: 40px;
`;

const EpochsPrevious: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const futureProposals = useSelector(selectFutureProposals());

  const handlePrevious: React.MouseEventHandler = () => {
    navigate(ROUTES.MAIN.EPOCHS);
  };

  return (
    <>
      <Window onPrevious={handlePrevious}>
        <EpochStatsSection
          isWithProgress={false}
          className={StatsSectionClass} data={true}></EpochStatsSection>
        <ProposalsList isFuture={true} type={PROPOSALS.PREV} title='Future proposals' data={futureProposals.items}></ProposalsList>
      </Window>
    </>
  );
};

export default EpochsPrevious;
