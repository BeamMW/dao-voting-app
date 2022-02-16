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
import { useParams } from 'react-router-dom';

const StatsSectionClass = css`
  margin-bottom: 40px;
`;

const Epoch = styled.div`
    padding: 20px;
    border-radius: 10px;
    width: 100%;
    background-color: rgba(255, 255, 255, .05)
`;

const EpochPage: React.FC = () => {
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
  const params = useParams();
  const currentProposals = useSelector(selectCurrentProposals());
  const prevProposals = useSelector(selectPrevProposals());

  const handlePrevious: React.MouseEventHandler = () => {
    //navigate according epoch type
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
        <Epoch>
            
            {params.id}
        </Epoch>
      </Window>
      <DepositPopup visible={isDepositVisible} onCancel={()=>{setIsDepositVisible(false)}}/>
      <WithdrawPopup visible={isWithdrawVisible} onCancel={()=>{setIsWithdrawVisible(false)}}/>
    </>
  );
};

export default EpochPage;
