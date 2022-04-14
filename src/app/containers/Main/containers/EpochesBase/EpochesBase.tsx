import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button } from '@app/shared/components';
import { EpochStatsSection, ProposalsList } from '@app/containers/Main/components';
import { selectCurrentProposals, selectPrevProposals, selectRate } from '../../store/selectors';
import { loadRate } from '@app/containers/Main/store/actions';
import { IconOldEpoches } from '@app/shared/icons';
import { PROPOSALS, ROUTES } from '@app/shared/constants';

const StatsSectionClass = css`
  margin-bottom: 40px;
`;

const OldButtonClass = css`
  max-width: 205px !important;
  margin: 30px auto !important;

  > svg {
    margin-bottom: 2px;
  }
`;

const EpochesBase: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rate = useSelector(selectRate());

  useEffect(() => {
    if (!rate) {
      dispatch(loadRate.request());
    }
  }, [dispatch, rate]);

  const currentProposals = useSelector(selectCurrentProposals());
  const prevProposals = useSelector(selectPrevProposals());

  const handleOldEpochs = () => {
    navigate(ROUTES.MAIN.PREVIOUS_EPOCHS);
  }

  return (
    <>
      <Window>
        <EpochStatsSection state='progress' className={StatsSectionClass}></EpochStatsSection>
        <ProposalsList title='Proposals' type={PROPOSALS.CURRENT} data={currentProposals.items}></ProposalsList>
        { prevProposals.items.length > 0 ?
          <Button variant='ghost' icon={IconOldEpoches} onClick={handleOldEpochs} className={OldButtonClass}>show old epochs</Button> : 
          null 
        }
      </Window>
    </>
  );
};

export default EpochesBase;
