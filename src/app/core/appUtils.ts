// eslint-disable-next-line import/no-named-as-default, import/extensions
import BeamDappConnector from '@core/BeamDappConnector.js';
import { IAsset, IMetadataPairs } from '@core/types';

/** Same parsing as dex-app (values may contain '='). */
export function parseMetadata(metadata: string | undefined | null): IMetadataPairs {
  if (!metadata || typeof metadata !== 'string') {
    return {} as IMetadataPairs;
  }
  const splittedMetadata = metadata.split(';');
  splittedMetadata.shift();
  return splittedMetadata.reduce((accumulator: IMetadataPairs, value: string) => {
    if (!value) return accumulator;
    const data = value.split(/=(.*)/s);
    const k = data[0];
    const v = data[1] ?? '';
    return { ...accumulator, [k]: v };
  }, {} as IMetadataPairs);
}

export function assetShortLabel(m: IMetadataPairs | undefined): string {
  if (!m) return '';
  return (m.SN || m.UN || m.N || '').trim();
}

/** Dex PoolTable / ReactSelect: `truncate(SN|UN|N|'Token', 6) (id:aid)` */
const ASSET_LABEL_MAX = 6;

export function assetDisplayWithId(assetId: number, parsedMetadata: IMetadataPairs | undefined): string {
  if (assetId === 0) {
    return 'BEAM (id:0)';
  }
  const ticker = assetShortLabel(parsedMetadata) || 'Token';
  return `${truncate(ticker, ASSET_LABEL_MAX)} (id:${assetId})`;
}

export function enrichAssetsWithMetadata(assets: any[]): IAsset[] {
  return assets.map((a: any) => {
    const rawId = a.asset_id ?? a.aid ?? 0;
    const n = Number(rawId);
    const id = Number.isFinite(n) ? n : 0;
    let parsedMetadata: IMetadataPairs;
    if (
      a.metadata_pairs
      && typeof a.metadata_pairs === 'object'
      && !Array.isArray(a.metadata_pairs)
    ) {
      parsedMetadata = a.metadata_pairs as IMetadataPairs;
    } else if (typeof a.metadata === 'string') {
      parsedMetadata = parseMetadata(a.metadata);
    } else {
      parsedMetadata = {} as IMetadataPairs;
    }
    return { ...a, asset_id: id, parsedMetadata };
  });
}

export const copyToClipboard = (value: string) => {
  let textField = document.createElement('textarea');
  textField.innerText = value;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
};

export function compact(value: string, stringLength: number = 5): string {
  if (value.length <= 11) {
    return value;
  }
  return `${value.substr(0, stringLength)}…${value.substr(-stringLength, stringLength)}`;
}

const LENGTH_MAX = 8;

export function truncate(value: string, maxLen: number = LENGTH_MAX): string {
  if (!value) {
    return '';
  }

  if (value.length <= maxLen) {
    return value;
  }

  return `${value.slice(0, maxLen)}…`;
}

export function toUSD(amount: number, rate: number): string {
  switch (true) {
    case amount === 0 || Number.isNaN(amount):
      return '0 USD';
    case amount > 0.011: {
      const value = amount * rate;
      return `${value.toFixed(2)} USD`;
    }
    default:
      return '< 1 cent';
  }
}

export function calcVotingPower(value: number, fullValue: number) {
  if (!value || value == 0) {
    return 0;
  }

  const power = Number((100 / (fullValue / value)).toFixed(2));
  if (power < 1) {
    return '< 1';
  }

  return power;
}

export function fromGroths(value: number): number {
  if (!value || value === 0) return 0;
  return parseFloat(BeamDappConnector.grothToBeam(value));
}

export function toGroths(value: number): number {
  return value > 0 ? BeamDappConnector.beamToGroth(value) : 0;
}

export function getSign(positive: boolean): string {
  return positive ? '+ ' : '- ';
}

export function Base64DecodeUrl(str){
  if (str.length % 4 != 0)
    str += ('===').slice(0, 4 - (str.length % 4));
  return str.replace(/-/g, '+').replace(/_/g, '/');
}

export function getProposalId (id: number) {
  if (id < 10) {
      return '000' + id;
  } else if (id < 100) {
      return '00' + id;
  } else if (id < 1000) {
      return '0' + id;
  } 
}

export function Base64EncodeUrl(str){
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

export function openInNewTab (url) {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export function numFormatter(num) {
  if (num > 999 && num < 1000000) {
      return parseFloat((num / 1000).toFixed(2)) + 'K';  
  } else if (num >= 1000000) {
      return parseFloat((num / 1000000).toFixed(2)) + 'M';
  } else if (num <= 999){
      return parseFloat(num.toFixed(2));
  }
}