import React from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Window } from '@app/shared/components';
import { EpochStatsSection } from '@app/containers/Main/components';
import { ROUTES } from '@app/shared/constants';

const StatsSectionClass = css`
    margin-bottom: 40px;
    margin-top: 65px;
`;

const StyledTitle = styled.div`
    position: absolute;
    left: 50%;
    margin-left: -60px;
    top: 95px;
    font-weight: 700;
    font-size: 14px;
    text-align: center;
    letter-spacing: 3.1px;
`;

const StakedInfo: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handlePrevious: React.MouseEventHandler = () => {
    navigate(ROUTES.MAIN.EPOCHS);
  };

  return (
    <>
      <Window onPrevious={handlePrevious}>
        <StyledTitle>STAKED INFO</StyledTitle>
        <EpochStatsSection
          state='stake'
          className={StatsSectionClass}></EpochStatsSection>
      </Window>
    </>
  );
};

export default StakedInfo;
