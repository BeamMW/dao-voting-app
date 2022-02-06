import React, { useRef, useState } from 'react';
import { styled } from '@linaria/react';
import Utils from '@core/utils.js';

const Container = styled.div<{ bgColor: string }>`
  background-color: ${({ bgColor }) => Utils.isWeb() ? bgColor : 'transparent'};
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const StyledTitle = styled.span`
  font-weight: 500;
  font-size: 36px;
  margin-bottom: 20px;
`;

const Window: React.FC<any> = ({
  children,
}) => {
  const rootRef = useRef();
  
  return (
    <Container bgColor={Utils.getStyles().background_main} ref={rootRef}>
      <StyledTitle>Voting</StyledTitle>
      { children }
    </Container>
  );
};

export default Window;
