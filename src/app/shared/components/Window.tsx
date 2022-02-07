import React, { useRef, useState } from 'react';
import { styled } from '@linaria/react';
import Utils from '@core/Utils.js';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';

const Container = styled.div<{ bgColor: string }>`
  background-color: ${({ bgColor }) => Utils.isWeb() ? bgColor : 'transparent'};
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const StyledTitle = styled.div`
  font-weight: 500;
  font-size: 36px;
  margin-bottom: 20px;
`;

const TitleValue = styled.span`
  cursor: pointer;
`;

const Window: React.FC<any> = ({
  children,
}) => {
  const navigate = useNavigate();
  const rootRef = useRef();

  const titleClicked = () => {
    navigate(ROUTES.MAIN.EPOCHES);
  };
  
  return (
    <Container bgColor={Utils.getStyles().background_main} ref={rootRef}>
      <StyledTitle>
        <TitleValue onClick={titleClicked}>Voting</TitleValue>
      </StyledTitle>
      { children }
    </Container>
  );
};

export default Window;
