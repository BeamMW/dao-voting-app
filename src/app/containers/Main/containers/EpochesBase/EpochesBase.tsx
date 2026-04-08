import React, { useEffect } from 'react';
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

const EpochNavButtonsClass = css`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  margin: 30px auto 40px;
`;

const EpochNavSpacerClass = css`
  width: 24px;
  flex-shrink: 0;
`;

const EpochNavButtonClass = css`
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: auto !important;
  flex: 0 0 auto;
  max-width: 240px !important;
  margin: 0 !important;
  margin-bottom: 0 !important;

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
  };

  const handleFutureProposals = () => {
    navigate(ROUTES.MAIN.FUTURE_EPOCHS);
  };

  return (
    <>
      <Window>
        <EpochStatsSection state='progress' className={StatsSectionClass}></EpochStatsSection>
        <ProposalsList title='Proposals' type={PROPOSALS.CURRENT} data={currentProposals.items}></ProposalsList>
        <div className={EpochNavButtonsClass}>
          { prevProposals.items.length > 0 ? (
            <>
              <Button variant='ghost' icon={IconOldEpoches} onClick={handleOldEpochs} className={EpochNavButtonClass}>show old epochs</Button>
              <div className={EpochNavSpacerClass} aria-hidden />
            </>
          ) : null }
          <Button variant='ghost' onClick={handleFutureProposals} className={EpochNavButtonClass}>show future proposals</Button>
        </div>
      </Window>
    </>
  );
};

export default EpochesBase;
