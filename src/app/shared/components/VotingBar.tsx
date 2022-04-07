import React, {useRef, useEffect, useState} from 'react';
import { styled } from '@linaria/react';
import { fromGroths } from '@app/core/appUtils';

interface ProgressBarProps {
  active: boolean;
  percent: number;
  voteType: 'yes' | 'no';
  value: number;
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

const VotingBar: React.FC<ProgressBarProps> = ({ active, percent, value, voteType }) => {
  const valRef = useRef(null);
  const contRef = useRef(null);
  const progressRef = useRef(null);
  const [valueOffset, setValueOffset] = useState(0);
  useEffect(() => {
    if (valRef.current && contRef.current && progressRef.current) {
      if (progressRef.current.offsetWidth > valRef.current.offsetWidth + 10) {
        setValueOffset(progressRef.current.offsetWidth - valRef.current.offsetWidth - 20);
      }
    }

  }, [valRef.current, contRef.current, progressRef.current]);
  return (
    <ContainerStyled ref={contRef} voteType={voteType} valueOffset={valueOffset}>
      <Line ref={progressRef} percent={percent} active={active} voteType={voteType}/>
      {value > 0 && <div ref={valRef} className='value'>{fromGroths(value)} BEAMX</div>}
    </ContainerStyled>
  );
};

export default VotingBar;
