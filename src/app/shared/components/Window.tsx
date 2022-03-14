import React, { useRef, useState } from 'react';
import { styled } from '@linaria/react';
import Utils from '@core/Utils.js';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { IconBackWindow, IconAddProposal } from '@app/shared/icons';
import { useSelector } from 'react-redux';
import { selectAppParams, selectIsModerator } from '@app/containers/Main/store/selectors';
import { NewProposalPopup, Button } from './';

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

  > .new-button-class {
    position: absolute !important;
    right: 20px !important;
    top: 30px !important;
  }
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

  const [isNewProposalVisible, setIsNewProposalVisible] = useState(false);
  const appParams = useSelector(selectAppParams());
  const isModerator = useSelector(selectIsModerator());

  const titleClicked = () => {
    navigate(ROUTES.MAIN.EPOCHS);
  };

  const handleNewProposal = () => {
    setIsNewProposalVisible(true);
  };

  const hideNewProposalPopup = () => {
    setIsNewProposalVisible(false);
  };
  
  return (
    <Container bgColor={Utils.getStyles().background_main} ref={rootRef}>
      <StyledTitle>
        <TitleValue onClick={titleClicked}>Voting</TitleValue>
        {appParams.is_admin || isModerator ?
        <Button className='new-button-class' variant='ghostBordered' pallete='green'
        onClick={()=>handleNewProposal()}
        icon={IconAddProposal}>create new proposal</Button> : null}
      </StyledTitle>
      { onPrevious ? (
      <BackStyled>
        <div className='control' onClick={onPrevious}>
          <IconBackWindow/>
          <span className='control-text'>back</span>
        </div>
      </BackStyled>) : null}
      { children }
      <NewProposalPopup visible={isNewProposalVisible} onCancel={()=>{hideNewProposalPopup()}}/>
    </Container>
  );
};

export default Window;
