import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { ClockCircular, ClockCircularExpires } from '@app/shared/icons';
import { SystemState, VotingAppParams } from '@app/core/types';

interface SitesProps {
  appParams: VotingAppParams;
  systemState: SystemState;
  cHeight: number;
}

const Timer = styled.span<{hours: number, minutes: number}>`
  font-style: italic;
  font-size: 14px;
  line-height: 17px;
  color: ${({ hours, minutes }) => {
    switch (true) {
      case hours === 0 && minutes > 0:
        return 'var(--color-red-expiring)';
      default:
        return 'var(--color-white)';
    }
  }};
`;

const TimerValue = styled.span`
  margin-left: 10px;
`;

const ExpiresTimer: React.FC<SitesProps> = ({ 
  appParams,
  systemState,
  cHeight,
}) => {
    const [expiresData, setExpiresData] = useState('');
    const [timeLeft, setTimeLeft] = useState({h: null, m: null});

    useEffect(
      () => {
        const blocksLeft = appParams.epoch_dh * appParams.current.iEpoch + cHeight - 1 - systemState.current_height;
        if (blocksLeft > 0) {
          const d = Math.floor(blocksLeft / (60*24));
          const h = Math.floor(blocksLeft % (60*24) / 60);
          const m = Math.floor(blocksLeft % 60);

          setTimeLeft({h, m});
          setExpiresData(`${d} d ${h} h ${m} m`);
        }
      },
      [cHeight, systemState],
    );

    return expiresData.length ? (
        <Timer hours={timeLeft.h} minutes={timeLeft.m}>
            { timeLeft.h === 0 && timeLeft.m > 0 ? <ClockCircularExpires/> : <ClockCircular/>}
            <TimerValue>expires in {expiresData}</TimerValue>
        </Timer>
    ) : (
        <></>
    );
};

export default ExpiresTimer;
