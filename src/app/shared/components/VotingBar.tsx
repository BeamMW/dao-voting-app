import React, {useRef, useEffect, useState} from 'react';
import { styled } from '@linaria/react';
import { fromGroths, numFormatter } from '@app/core/appUtils';
import { Popover } from 'react-tiny-popover';
import { useSelector } from 'react-redux';
import { selectTotalsView } from '@app/containers/Main/store/selectors';

interface ProgressBarProps {
  active: boolean;
  percent: number;
  voteType: 'yes' | 'no';
  value: number;
  quorum?: number;
  qType?: string;
}

const ContainerStyled = styled.div<{voteType: string, valueOffset: number;}>`
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 30px;
  margin: 0;
  border-radius: 20px;
  margin-top: ${({ voteType }) => voteType === 'no' ? `10px` : `0`};
  padding: 0 10px;

  &:before {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 30px;
    border: none;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
  }

  > .value {
    position: absolute;
    font-weight: 700;
    font-size: 14px;
    margin-top: 7px;
    margin-left: ${({valueOffset}) => valueOffset}px;
  }
`;

const Line = styled.div<{percent: number, voteType: string, active:boolean}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 30px;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  opacity: ${({ active }) => active ? `0.8` : `0.5`};
  background-color: ${({ voteType }) => voteType === 'yes' ? `var(--color-green)` : `var(--color-vote-red)`};
  width: ${({ percent }) => percent}%;
`;

const QuorumLine = styled.div<{margin: number, percent: number}>`
  position: absolute;
  border-left: 2px dashed ${({ percent, margin }) => margin <= percent ? '#042548' : '#ffffff'};
  height: 30px;
  margin-left: calc(${({ margin }) => margin}% - 5px);
`;

const StyledPopover = styled.div`
  padding: 15px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(30px);
  border-radius: 5px;
  margin-bottom: 9px;

  :after {
    content: '';
    position: absolute;
    left: 47%;
    top: 47px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid rgba(255, 255, 255, 0.15);
    clear: both;
  }
`;

const VotingBar: React.FC<ProgressBarProps> = ({ active, percent, value, voteType, quorum, qType }) => {
  const valRef = useRef(null);
  const contRef = useRef(null);
  const progressRef = useRef(null);
  const [valueOffset, setValueOffset] = useState(0);
  const [isPopoverOpen, setPopoverState] = useState(false);
  const totalsView = useSelector(selectTotalsView());

  useEffect(() => {
    if (valRef.current && contRef.current && progressRef.current) {
      if (progressRef.current.offsetWidth > valRef.current.offsetWidth + 10) {
        setValueOffset(progressRef.current.offsetWidth - valRef.current.offsetWidth - 20);
      }
    }

  }, [valRef.current, contRef.current, progressRef.current]);

  return (
    <ContainerStyled ref={contRef} voteType={voteType} valueOffset={valueOffset}>
      <Line percent={percent} active={active} voteType={voteType} ref={progressRef}/>
      {value > 0 && <div ref={valRef} className='value'>{numFormatter(fromGroths(value))} BEAMX</div>}
      {voteType === 'yes' && quorum !== undefined && quorum && 
        <Popover
          isOpen={isPopoverOpen}
          positions={['top', 'bottom', 'left', 'right']}
          content={
             qType === 'beamx' ?
            <StyledPopover>
              {quorum} BEAMX required for approval
            </StyledPopover> :
            <StyledPopover>
              {quorum}% YES votes required for approval
            </StyledPopover>
          }
        >
          <QuorumLine margin={qType === 'percent' ? quorum : (quorum / fromGroths(totalsView.stake_active) * 100)} 
            percent={percent} onMouseEnter={()=>setPopoverState(true)} onMouseLeave={()=>setPopoverState(false)}/>
        </Popover>
      }
    </ContainerStyled>
  );
};

export default VotingBar;
