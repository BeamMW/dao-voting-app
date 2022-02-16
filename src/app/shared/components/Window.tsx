import React, { useRef, useState } from 'react';
import { styled } from '@linaria/react';
import Utils from '@core/Utils.js';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { IconBackWindow } from '@app/shared/icons';

interface WindowProps {
  onPrevious?: React.MouseEventHandler | undefined;
}

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

const BackStyled = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px 5px;
  font-weight: bold;
  font-size: 14px;

  > .control {
    cursor: pointer;
  }

  > .control .control-text {
    margin-left: 15px;
  }
`;

const Window: React.FC<WindowProps> = ({
  children,
  onPrevious
}) => {
  const navigate = useNavigate();
  const rootRef = useRef();

  const titleClicked = () => {
    navigate(ROUTES.MAIN.EPOCHS);
  };
  
  return (
    <Container bgColor={Utils.getStyles().background_main} ref={rootRef}>
      <StyledTitle>
        <TitleValue onClick={titleClicked}>Voting</TitleValue>
      </StyledTitle>
      { onPrevious ? (
      <BackStyled>
        <div className='control' onClick={onPrevious}>
          <IconBackWindow/>
          <span className='control-text'>back</span>
        </div>
      </BackStyled>) : null}
      { children }
    </Container>
  );
};

export default Window;
