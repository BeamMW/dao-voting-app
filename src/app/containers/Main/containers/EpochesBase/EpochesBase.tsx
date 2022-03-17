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
import { DepositPopup, WithdrawPopup } from '../../components/EpochesBase';
import { PROPOSALS } from '@app/shared/constants';

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

  const [isDepositVisible, setIsDepositVisible] = useState(false);
  const [isWithdrawVisible, setIsWithdrawVisible] = useState(false);

  const currentProposals = useSelector(selectCurrentProposals());
  const prevProposals = useSelector(selectPrevProposals());

  return (
    <>
      <Window>
        <EpochStatsSection
          isDepositVisible={isDepositVisible}
          depositPopupUpdate={(state: boolean)=>setIsDepositVisible(state)}
          isWithdrawVisible={isDepositVisible}
          withdrawPopupUpdate={(state: boolean)=>setIsWithdrawVisible(state)}
          className={StatsSectionClass} data={true}></EpochStatsSection>
        <ProposalsList title='Proposals' type={PROPOSALS.CURRENT} data={currentProposals.items}></ProposalsList>
        { prevProposals.items.length > 0 ?
          <Button variant='ghost' icon={IconOldEpoches} className={OldButtonClass}>show old epochs</Button> : 
          null 
        }
      </Window>
      <DepositPopup visible={isDepositVisible} onCancel={()=>{setIsDepositVisible(false)}}/>
      <WithdrawPopup visible={isWithdrawVisible} onCancel={()=>{setIsWithdrawVisible(false)}}/>
    </>
  );
};

export default EpochesBase;
