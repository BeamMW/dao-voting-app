import React from 'react';
import { styled } from '@linaria/react';
import { IconBeam, IconBeamx, IconAsset } from '@app/shared/icons';
import { PALLETE_ASSETS } from '@app/shared/constants';

export interface AssetIconProps {
  asset_id?: number;
  beamx_id?: number;
  className?: string;
}

const ContainerStyled = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
  color: ${({ color }) => color};
`;

const AssetIcon: React.FC<AssetIconProps> = ({ asset_id = 0, beamx_id, className }) => {
  let IconComponent = IconAsset;
  if (asset_id === 0) {
    IconComponent = IconBeam;
  } else if (beamx_id !== undefined && asset_id === beamx_id) {
    IconComponent = IconBeamx;
  }

  const color = PALLETE_ASSETS[asset_id] ?? PALLETE_ASSETS[asset_id % PALLETE_ASSETS.length];

  return (
    <ContainerStyled color={color} className={className}>
      <IconComponent />
    </ContainerStyled>
  );
};

export default AssetIcon;
