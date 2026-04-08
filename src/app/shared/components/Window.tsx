import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { styled } from '@linaria/react';
import BeamDappConnector from '@core/BeamDappConnector.js';
import connector from '@core/connector';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@app/shared/constants';
import { IconBackWindow, IconAddProposal } from '@app/shared/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectAppParams, selectIsModerator, selectPopupsState } from '@app/containers/Main/store/selectors';
import { NewProposalPopup, Button, DepositPopup, WithdrawPopup, PublicKeyPopup } from './';
import { setPopupState } from '@app/containers/Main/store/actions';
import { css } from '@linaria/core';

interface WindowProps {
  onPrevious?: React.MouseEventHandler | undefined;
}

const Container = styled.div<{ bgColor: string }>`
  position: relative;
  background-color: ${({ bgColor }) => (BeamDappConnector.isWeb() || /android/i.test(navigator.userAgent)) ? bgColor : 'transparent'};
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  @media screen and (max-width : 424px) {
    padding: 10px 5px;
  }
`;

const NavBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const NavTab = styled.span<{ active: boolean }>`
  font-weight: 700;
  font-size: 36px;
  cursor: pointer;
  color: ${({ active }) => active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.3)'};
  transition: color 0.15s;

  &:hover {
    color: ${({ active }) => active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.6)'};
  }
`;

const NavDivider = styled.span`
  font-weight: 300;
  font-size: 36px;
  color: rgba(255, 255, 255, 0.2);
  margin: 0 16px;
  user-select: none;
`;

const Controls = styled.span`
  height: 36px;
  position: absolute !important;
  right: 40px !important;
  top: 37px !important;
  display: flex;
  align-items: flex-end;

  @media screen and (max-width : 625px) {
    height: auto;
    right: 23px !important;
  }
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

const PkeyButtonClass = css`
  margin: 0 !important;
  min-width: 150px;
  text-align: end;
  font-weight: 400 !important;
  display: flex;
  font-size: 16px !important;
`;

const NewButtonClass = css`
  margin-bottom: 0 !important;
  margin-right: 30px !important;
`;

const Window: React.FC<WindowProps> = ({
  children,
  onPrevious
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef();
  const dispatch = useDispatch();

  const [isNewProposalVisible, setIsNewProposalVisible] = useState(false);
  const appParams = useSelector(selectAppParams());
  const isModerator = useSelector(selectIsModerator());
  const popupsState = useSelector(selectPopupsState());

  const isVotingActive = location.pathname.startsWith(ROUTES.MAIN.BASE);
  const isTreasuryActive = location.pathname.startsWith(ROUTES.TREASURY.BASE);

  const handlePkey = () => {
    dispatch(setPopupState({type: 'pkey', state: !popupsState.pkey}));
  };

  const handleNewProposal = () => {
    setIsNewProposalVisible(true);
  };

  const hideNewProposalPopup = () => {
    setIsNewProposalVisible(false);
  };

  return (
    <>
      <Container bgColor={connector.getStyles().background_main} ref={rootRef}>
        <NavBar>
          <NavTab active={isTreasuryActive} onClick={() => navigate(ROUTES.TREASURY.BASE)}>
            TREASURY
          </NavTab>
          <NavDivider>|</NavDivider>
          <NavTab active={isVotingActive} onClick={() => navigate(ROUTES.MAIN.EPOCHS)}>
            VOTING
          </NavTab>
          {isVotingActive && (
            <Controls>
              {appParams.is_admin || isModerator ? (
                <Button className={NewButtonClass} variant='ghostBordered' pallete='green'
                  onClick={() => handleNewProposal()}
                  icon={IconAddProposal}>
                  create new proposal
                </Button>
              ) : null}
              <Button className={PkeyButtonClass}
                onClick={() => handlePkey()}
                pallete='green' variant='link'>
                  Show my public key
              </Button>
            </Controls>
          )}
        </NavBar>
        {onPrevious ? (
          <BackStyled>
            <div className='control' onClick={onPrevious}>
              <IconBackWindow/>
              <span className='control-text'>back</span>
            </div>
          </BackStyled>
        ) : null}
        {children}
        <NewProposalPopup visible={isNewProposalVisible} onCancel={() => hideNewProposalPopup()}/>
      </Container>

      {typeof document !== 'undefined' && createPortal(
        <>
          <DepositPopup visible={popupsState.deposit} onCancel={() => {
            dispatch(setPopupState({type: 'deposit', state: false}));
          }}/>
          <WithdrawPopup visible={popupsState.withdraw} onCancel={() => {
            dispatch(setPopupState({type: 'withdraw', state: false}));
          }}/>
          <PublicKeyPopup visible={popupsState.pkey} onCancel={() => {
            dispatch(setPopupState({type: 'pkey', state: false}));
          }}/>
        </>,
        document.body,
      )}
    </>
  );
};

export default Window;
