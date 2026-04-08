import React, { useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { Popup, Button } from '@app/shared/components';
import AssetIcon from '@app/shared/components/AssetIcon';
import { IconCancel, IconDepositBlue } from '@app/shared/icons';
import { IAsset } from '@core/types';
import { assetDisplayWithId, assetShortLabel, toGroths } from '@core/appUtils';
import { VaultDeposit } from '@core/api';
import { ShaderRuntimeMap } from '@core/shaderRegistry';

interface VaultDepositPopupProps {
  visible: boolean;
  onCancel: () => void;
  assets: IAsset[];
  shaderMap: ShaderRuntimeMap | null;
  beamxId?: number;
}

const PopupClass = css`
  width: 440px !important;
  @media screen and (max-width: 625px) { width: 92% !important; }
`;

const BtnClass = css`
  max-width: 138px !important;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 14px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
`;

/* ── Asset selector button ── */
const SelectorBtn = styled.button`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 9px 12px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  transition: border-color 0.15s;
  &:hover { border-color: rgba(0, 246, 210, 0.5); }
`;

const SelectorLabel = styled.span`
  flex: 1;
  text-align: left;
  font-weight: 600;
`;

const Chevron = styled.span<{ open: boolean }>`
  margin-left: auto;
  padding-left: 8px;
  opacity: 0.45;
  font-size: 9px;
  transform: ${({ open }) => open ? 'rotate(180deg)' : 'none'};
  transition: transform 0.15s;
`;

/* ── Inline search panel (replaces separate modal) ── */
const SearchPanel = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 4px;
`;

const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 9px 12px;
  color: white;
  font-size: 13px;
  outline: none;
  &::placeholder { color: rgba(255, 255, 255, 0.3); }
  &:focus { background: rgba(255, 255, 255, 0.07); }
`;

const AssetList = styled.div`
  max-height: 180px;
  overflow-y: auto;
`;

const AssetRow = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 9px 12px;
  cursor: pointer;
  background: ${({ selected }) => selected ? 'rgba(0, 246, 210, 0.08)' : 'transparent'};
  &:hover { background: rgba(255, 255, 255, 0.06); }
`;

const AssetRowName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: white;
`;

const EmptyMsg = styled.div`
  padding: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
`;

/* ── Amount input ── */
const AmountInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 10px 14px;
  color: white;
  font-size: 16px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: rgba(0, 246, 210, 0.5); }
  &::placeholder { color: rgba(255, 255, 255, 0.3); }
`;

/* ─── helpers ─── */
const REG_AMOUNT = /^(?!0\d)(\d+)(\.)?(\d{0,8})?$/;

const BEAM_ASSET: IAsset = { asset_id: 0, metadata: '', parsedMetadata: { N: 'BEAM', SN: 'BEAM' } };

function assetMatches(asset: IAsset, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const sn = (assetShortLabel(asset.parsedMetadata) || '').toLowerCase();
  const n = (asset.parsedMetadata?.N || '').toLowerCase();
  return sn.includes(q) || n.includes(q) || String(asset.asset_id).includes(q);
}

const VaultDepositPopup: React.FC<VaultDepositPopupProps> = ({
  visible, onCancel, assets, shaderMap, beamxId,
}) => {
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState<IAsset>(BEAM_ASSET);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const allAssets = [BEAM_ASSET, ...assets];
  const filtered = allAssets.filter((a) => assetMatches(a, query));

  const handleToggleSearch = () => {
    const next = !searchOpen;
    setSearchOpen(next);
    if (next) {
      setQuery('');
      setTimeout(() => searchRef.current?.focus(), 30);
    }
  };

  const handleSelectAsset = (asset: IAsset) => {
    setSelected(asset);
    setSearchOpen(false);
    setQuery('');
  };

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    VaultDeposit(
      shaderMap?.daoVault?.contractBytes ?? null,
      shaderMap?.daoVault?.cid ?? '',
      selected.asset_id,
      toGroths(parseFloat(amount)),
    );
    reset();
    onCancel();
  };

  const reset = () => {
    setAmount('');
    setSelected(BEAM_ASSET);
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <Popup
      className={PopupClass}
      visible={visible}
      title="Deposit to DAO Vault"
      cancelButton={(
        <Button className={BtnClass} variant="ghost" icon={IconCancel} onClick={() => { reset(); onCancel(); }}>
          cancel
        </Button>
      )}
      confirmButton={(
        <Button className={BtnClass} variant="regular" pallete="purple" icon={IconDepositBlue} onClick={handleDeposit}>
          deposit
        </Button>
      )}
      onCancel={() => { reset(); onCancel(); }}
    >
      <Field>
        <FieldLabel>Asset</FieldLabel>

        <SelectorBtn type="button" onClick={handleToggleSearch}>
          <AssetIcon asset_id={selected.asset_id} beamx_id={beamxId} />
          <SelectorLabel>{assetDisplayWithId(selected.asset_id, selected.parsedMetadata)}</SelectorLabel>
          <Chevron open={searchOpen}>▼</Chevron>
        </SelectorBtn>

        {searchOpen && (
          <SearchPanel>
            <SearchInput
              ref={searchRef}
              placeholder="Search by name or id…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <AssetList>
              {filtered.length === 0 ? (
                <EmptyMsg>No assets found</EmptyMsg>
              ) : (
                filtered.map((a) => (
                  <AssetRow
                    key={a.asset_id}
                    selected={a.asset_id === selected.asset_id}
                    onClick={() => handleSelectAsset(a)}
                  >
                    <AssetIcon asset_id={a.asset_id} beamx_id={beamxId} />
                    <AssetRowName>{assetDisplayWithId(a.asset_id, a.parsedMetadata)}</AssetRowName>
                  </AssetRow>
                ))
              )}
            </AssetList>
          </SearchPanel>
        )}
      </Field>

      <Field>
        <FieldLabel>Amount</FieldLabel>
        <AmountInput
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '' || REG_AMOUNT.test(v)) setAmount(v);
          }}
        />
      </Field>
    </Popup>
  );
};

export default VaultDepositPopup;
