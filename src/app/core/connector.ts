// eslint-disable-next-line import/no-named-as-default, import/extensions
import BeamDappConnector from './BeamDappConnector.js';

const connector = new BeamDappConnector({
  appName: 'BEAM DAO Voting app',
  apiVersion: 'current',
  minApiVersion: '6.2',
  headlessNode: 'eu-node01.masternet.beam.mw:8200',
  network: 'mainnet',
  debug: false,
});

export default connector;
