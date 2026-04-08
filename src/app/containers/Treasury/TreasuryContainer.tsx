import React, { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button } from '@app/shared/components';
import AssetIcon from '@app/shared/components/AssetIcon';
import VaultDepositPopup from './VaultDepositPopup';
import { actions, selectors } from './store';
import { assetDisplayWithId, assetShortLabel } from '@core/appUtils';
import BeamDappConnector from '@core/BeamDappConnector.js';
import { IAsset } from '@core/types';
import { selectAppParams } from '@app/containers/Main/store/selectors';
import { AppState } from '@app/shared/interface';

const selectShaderMap = (state: AppState) => state.main.shaderRuntimeMap;

/* ═══════════════════════════════════════════════════════
   Governance Section
═══════════════════════════════════════════════════════ */

const GLASS_H = 123;

const GovSection = styled.div`
  background: rgba(0, 246, 210, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;

const GovHeader = styled.div`
  font-size: 12px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
`;

const GovTotalLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
`;

const GovTotalValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
`;

const GovContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const GovLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const GovStatLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 14px;
`;

const GovStatValue = styled.div`
  font-size: 16px;
  color: white;
`;

const GovRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
`;

/* Label above bar (distributed overflow) */
const BarLabelTop = styled.span`
  font-size: 10px;
  color: white;
  text-align: center;
  margin-bottom: 2px;
`;

/* Label below bar (locked overflow) */
const BarLabelBottom = styled.span`
  font-size: 10px;
  color: white;
  text-align: center;
  margin-top: 2px;
`;

/* The glass bar – all child sections are absolutely positioned */
const GlassBar = styled.div`
  width: 56px;
  height: ${GLASS_H}px;
  border-radius: 4px;
  background: rgba(0, 246, 210, 0.5);
  position: relative;
  overflow: hidden;
`;

/* Distributed label: absolute, at very top */
const DistributedLabel = styled.span`
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  font-size: 10px;
  color: white;
  text-align: center;
  z-index: 30;
`;

/* Available section: sits between distributed gap and locked section */
const AvailableSection = styled.div<{ top: number; height: number }>`
  position: absolute;
  top: ${({ top }) => top}px;
  left: 0;
  right: 0;
  height: ${({ height }) => height}px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.5);
  z-index: 20;
`;

/* Available label inside the available section */
const AvailLabel = styled.span`
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  font-size: 10px;
  color: white;
  text-align: center;
`;

/* Locked section: solid bright cyan at bottom */
const LockedSection = styled.div<{ height: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${({ height }) => height}px;
  background: #00f6d2;
  color: #042548;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  display: flex;
  flex-direction: column;
  z-index: 10;
`;

/* Locked label at bottom of locked section */
const LockedLabel = styled.span`
  margin-top: auto;
  text-align: center;
  font-size: 10px;
  padding-bottom: 2px;
`;

const GovSeparator = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
`;

/* ═══════════════════════════════════════════════════════
   Vault Section
═══════════════════════════════════════════════════════ */

const Card = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 20px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  flex: 1;
`;

const DepositBtnClass = css`
  min-width: unset !important;
  padding: 5px 14px !important;
  font-size: 12px !important;
  margin: 0 !important;
`;

const FundRow = styled.div`
  display: flex;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  &:last-child { border-bottom: none; }
`;

const FundLeft = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const FundName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const FundAmount = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
`;

const LoadingText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  padding: 40px 0;
`;

/* ─────────────────── helpers ─────────────────── */

function formatHumanGroths(groths: number): string {
  return BeamDappConnector.formatAmount(BeamDappConnector.grothToBeam(groths));
}

/** Amount column: `<amount> <SN>` with SN from metadata; falls back to UN/N, then id. */
function assetTickerSn(aid: number, assets: IAsset[]): string {
  if (aid === 0) return 'BEAM';
  const found = assets.find((a) => Number(a.asset_id) === Number(aid));
  const sn = found?.parsedMetadata?.SN?.trim();
  if (sn) return sn;
  const fallback = assetShortLabel(found?.parsedMetadata);
  if (fallback) return fallback;
  return `id:${aid}`;
}

function formatAmountWithTicker(groths: number, ticker: string): string {
  return `${formatHumanGroths(groths)} ${ticker}`;
}

function formatVaultFundAmount(groths: number, aid: number, assets: IAsset[]): string {
  return formatAmountWithTicker(groths, assetTickerSn(aid, assets));
}

function getAssetDisplay(aid: number, assets: IAsset[]): string {
  const found = assets.find((a) => Number(a.asset_id) === Number(aid));
  return assetDisplayWithId(Number(aid), found?.parsedMetadata);
}

/* ─────────────────── Governance Bar ─────────────────── */

interface GovBarProps {
  total: number;
  distributed: number;
  available: number;
  locked: number;
  /** Governance token ticker (metadata SN when available). */
  ticker: string;
}

const GovernanceBar: React.FC<GovBarProps> = ({
  total,
  distributed,
  available,
  locked,
  ticker,
}) => {
  if (!total) return null;

  const lockedH = Math.ceil(GLASS_H * (locked / total));
  const distrH = Math.ceil(GLASS_H * (distributed / total));
  const availH = GLASS_H - distrH - lockedH;

  const lockedLabel = formatAmountWithTicker(locked, ticker);
  const distrLabel = formatAmountWithTicker(distributed, ticker);
  const availLabel = formatAmountWithTicker(available, ticker);

  const showDistrInsideBar = distrH > 18;
  const showLockedInsideBar = lockedH > 18;
  const showAvailInsideBar = availH > 18;

  return (
    <GovSection>
      <GovHeader>BEAMX GOVERNANCE</GovHeader>
      <GovTotalLabel>Total supply</GovTotalLabel>
      <GovTotalValue>{formatAmountWithTicker(total, ticker)}</GovTotalValue>

      <GovContainer>
        <GovLeft>
          <GovStatLabel>Distributed</GovStatLabel>
          <GovStatValue>{formatAmountWithTicker(distributed, ticker)}</GovStatValue>
          <GovStatLabel>Available</GovStatLabel>
          <GovStatValue>{formatAmountWithTicker(available, ticker)}</GovStatValue>
          <GovStatLabel>Locked</GovStatLabel>
          <GovStatValue>{formatAmountWithTicker(locked, ticker)}</GovStatValue>
        </GovLeft>

        <GovRight>
          {/* Distributed label above bar when section too small */}
          {!showDistrInsideBar && <BarLabelTop>{distrLabel}</BarLabelTop>}

          <GlassBar>
            {/* Distributed label at top of bar */}
            {showDistrInsideBar && <DistributedLabel>{distrLabel}</DistributedLabel>}

            {/* Available section: from distrH to GLASS_H - lockedH */}
            {availH > 0 && (
              <AvailableSection top={distrH} height={availH}>
                {showAvailInsideBar && <AvailLabel>{availLabel}</AvailLabel>}
              </AvailableSection>
            )}

            {/* Locked section: solid cyan at bottom */}
            {lockedH > 0 && (
              <LockedSection height={lockedH}>
                {showLockedInsideBar && <LockedLabel>{lockedLabel}</LockedLabel>}
              </LockedSection>
            )}
          </GlassBar>

          {/* Locked label below bar when section too small */}
          {!showLockedInsideBar && <BarLabelBottom>{lockedLabel}</BarLabelBottom>}
        </GovRight>
      </GovContainer>

      <GovSeparator />
    </GovSection>
  );
};

/* ─────────────────── Main component ─────────────────── */

const TreasuryContainer: React.FC = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectors.selectTreasuryIsLoading());
  const vaultFunds = useSelector(selectors.selectVaultFunds());
  const coreFarmTotals = useSelector(selectors.selectCoreFarmTotals());
  const corePreallocTotals = useSelector(selectors.selectCorePreallocTotals());
  const assets = useSelector(selectors.selectTreasuryAssets());
  const appParams = useSelector(selectAppParams());
  const shaderMap = useSelector(selectShaderMap);
  const beamxId: number | undefined = appParams?.aid;

  const [depositOpen, setDepositOpen] = useState(false);

  useEffect(() => {
    dispatch(actions.loadTreasuryData.request());
  }, [dispatch]);

  // Governance totals (farm + prealloc combined — same logic as dao-core-app)
  const govTotal = (coreFarmTotals?.total ?? 0) + (corePreallocTotals?.total ?? 0);
  const govDistributed = (coreFarmTotals?.received ?? 0) + (corePreallocTotals?.received ?? 0);
  const govAvailTotal = (coreFarmTotals?.avail ?? 0) + (corePreallocTotals?.avail ?? 0);
  const govAvailable = Math.max(0, govAvailTotal - govDistributed);
  const govLocked = Math.max(0, govTotal - govAvailTotal);

  const governanceTicker =
    beamxId !== undefined ? assetTickerSn(beamxId, assets) : 'BEAMX';

  return (
    <Window>
      {isLoading && !govTotal && !vaultFunds.length ? (
        <LoadingText>Loading treasury data…</LoadingText>
      ) : (
        <>
          {govTotal > 0 && (
            <GovernanceBar
              total={govTotal}
              distributed={govDistributed}
              available={govAvailable}
              locked={govLocked}
              ticker={governanceTicker}
            />
          )}

          <Card>
            <CardHeader>
              <SectionTitle>DAO VAULT</SectionTitle>
              <Button
                className={DepositBtnClass}
                variant="ghostBordered"
                pallete="green"
                onClick={() => setDepositOpen(true)}
              >
                donate
              </Button>
            </CardHeader>

            {vaultFunds.length === 0 ? (
              <FundRow>
                <FundName style={{ color: 'rgba(255,255,255,0.3)' }}>No funds</FundName>
              </FundRow>
            ) : (
              vaultFunds.map((fund) => (
                <FundRow key={fund.aid}>
                  <FundLeft>
                    <AssetIcon asset_id={fund.aid} beamx_id={beamxId} />
                    <FundName>{getAssetDisplay(fund.aid, assets)}</FundName>
                  </FundLeft>
                  <FundAmount>{formatVaultFundAmount(fund.amount, fund.aid, assets)}</FundAmount>
                </FundRow>
              ))
            )}
          </Card>
        </>
      )}

      <VaultDepositPopup
        visible={depositOpen}
        onCancel={() => setDepositOpen(false)}
        assets={assets}
        shaderMap={shaderMap}
        beamxId={beamxId}
      />
    </Window>
  );
};

export default TreasuryContainer;
