import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window } from '@app/shared/components';
import { EpochStatsSection, ProposalsList } from '@app/containers/Main/components';
import { selectPrevProposals } from '../../store/selectors';
import { PROPOSALS, ROUTES } from '@app/shared/constants';
import { useLocation } from 'react-router-dom';

interface locationProps { 
  filter: number,
}

const StatsSectionClass = css`
  margin-bottom: 40px;
`;

const EpochsPrevious: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const state = location.state as locationProps;
  const prevProposals = useSelector(selectPrevProposals());

  const handlePrevious: React.MouseEventHandler = () => {
    navigate(ROUTES.MAIN.EPOCHS);
  };

  return (
    <>
      <Window onPrevious={handlePrevious}>
        <EpochStatsSection
          state='none'
          className={StatsSectionClass}></EpochStatsSection>
        <ProposalsList filter={state ? state.filter : null} isFuture={true} type={PROPOSALS.PREV} 
          title='Proposals' data={[]} extendedData={prevProposals.items}
        ></ProposalsList>
      </Window>
    </>
  );
};

export default EpochsPrevious;
