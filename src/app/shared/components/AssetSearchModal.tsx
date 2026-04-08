import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { IAsset } from '@core/types';
import { assetShortLabel } from '@core/appUtils';
import AssetIcon from './AssetIcon';
import { IconCancel } from '@app/shared/icons';

export interface AssetOption {
  asset_id: number;
  label: string;
  asset: IAsset;
}

interface AssetSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: AssetOption) => void;
  assets: IAsset[];
  beamxId?: number;
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--z-modal-elevated);
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Panel = styled.div`
  width: 420px;
  max-width: 92vw;
  max-height: 70vh;
  background: #042548;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const Title = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  &:hover { color: white; }
`;

const SearchInput = styled.input`
  margin: 12px 16px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  padding: 10px 14px;
  outline: none;
  flex-shrink: 0;
  box-sizing: border-box;
  width: calc(100% - 32px);
  &::placeholder { color: rgba(255, 255, 255, 0.35); }
  &:focus { border-color: #00f6d2; }
`;

const List = styled.div`
  overflow-y: auto;
  flex: 1;
`;

const AssetRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.05); }
`;

const AssetName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: white;
`;

const AssetSub = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 6px;
`;

const AssetId = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin-left: 6px;
`;

const EmptyMsg = styled.div`
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
`;

const BEAM_ASSET: IAsset = {
  asset_id: 0,
  metadata: '',
  parsedMetadata: { N: 'BEAM', SN: 'BEAM' },
};

function makeLabel(asset: IAsset): string {
  const sn = assetShortLabel(asset.parsedMetadata);
  return sn || asset.parsedMetadata?.N || `Asset #${asset.asset_id}`;
}

function matches(asset: IAsset, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const sn = (assetShortLabel(asset.parsedMetadata) || '').toLowerCase();
  const n = (asset.parsedMetadata?.N || '').toLowerCase();
  return sn.includes(q) || n.includes(q) || String(asset.asset_id).includes(q);
}

const AssetSearchModal: React.FC<AssetSearchModalProps> = ({
  isOpen, onClose, onSelect, assets, beamxId,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allAssets = [BEAM_ASSET, ...assets];
  const filtered = allAssets.filter((a) => matches(a, query));

  const handleSelect = (asset: IAsset) => {
    onSelect({ asset_id: asset.asset_id, label: makeLabel(asset), asset });
    onClose();
  };

  return (
    <Backdrop onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Select asset</Title>
          <CloseBtn onClick={onClose}><IconCancel /></CloseBtn>
        </Header>
        <SearchInput
          ref={inputRef}
          placeholder="Search by name or id…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <List>
          {filtered.length === 0 ? (
            <EmptyMsg>No assets found</EmptyMsg>
          ) : (
            filtered.map((a) => {
              const sn = assetShortLabel(a.parsedMetadata);
              const fullName = a.parsedMetadata?.N || '';
              return (
                <AssetRow key={a.asset_id} onClick={() => handleSelect(a)}>
                  <AssetIcon asset_id={a.asset_id} beamx_id={beamxId} />
                  <AssetName>{sn || fullName || `Asset #${a.asset_id}`}</AssetName>
                  {sn && fullName && sn !== fullName && <AssetSub>{fullName}</AssetSub>}
                  <AssetId>(id: {a.asset_id})</AssetId>
                </AssetRow>
              );
            })
          )}
        </List>
      </Panel>
    </Backdrop>
  );
};

export default AssetSearchModal;
