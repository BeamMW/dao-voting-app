import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button } from '@app/shared/components';
import { EpochStatsSection, ProposalsList } from '@app/containers/Main/components';
import { selectFutureProposals } from '../../store/selectors';
import { DepositPopup, WithdrawPopup } from '../../components/EpochesBase';
import { ROUTES } from '@app/shared/constants';

const StatsSectionClass = css`
  margin-bottom: 40px;
`;

const EpochsFuture: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isDepositVisible, setIsDepositVisible] = useState(false);
  const [isWithdrawVisible, setIsWithdrawVisible] = useState(false);

  const futureProposals = useSelector(selectFutureProposals());

  const handlePrevious: React.MouseEventHandler = () => {
    navigate(ROUTES.MAIN.EPOCHS);
  };

  return (
    <>
      <Window onPrevious={handlePrevious}>
        <EpochStatsSection
          isWithProgress={false}
          isDepositVisible={isDepositVisible}
          depositPopupUpdate={(state: boolean)=>setIsDepositVisible(state)}
          isWithdrawVisible={isDepositVisible}
          withdrawPopupUpdate={(state: boolean)=>setIsWithdrawVisible(state)}
          className={StatsSectionClass} data={true}></EpochStatsSection>
        <ProposalsList isFuture={true} title='Future proposals' data={futureProposals}></ProposalsList>
      </Window>
      <DepositPopup visible={isDepositVisible} onCancel={()=>{setIsDepositVisible(false)}}/>
      <WithdrawPopup visible={isWithdrawVisible} onCancel={()=>{setIsWithdrawVisible(false)}}/>
    </>
  );
};

export default EpochsFuture;
