import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button } from '@app/shared/components';
import { EpochStatsSection, ProposalsList } from '@app/containers/Main/components';

const EpochesBase: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <Window>
      <EpochStatsSection data={true}></EpochStatsSection>
      <ProposalsList data={true}></ProposalsList>
    </Window>
  );
};

export default EpochesBase;
