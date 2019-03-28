import VatsimStatus from './vatsim-status';

export default function parseVatsimStatus(data: string): VatsimStatus {
  const lines = data.split(/\r?\n/);

  const fileUrls = lines
    .map(line => line.match(/^url0=(.+)$/))
    .filter(match => match !== null)
    .map(match => match[1]);

  const metarUrl = lines
    .map(line => line.match(/^metar0=(.+)$/))
    .find(match => match !== null)[1];

  return new VatsimStatus(fileUrls, metarUrl);
}
