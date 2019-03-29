import airports from '../airports/airports';
import { isPilot, Pilot } from './models/pilot';
import parseClient from './parse-client';
import VatsimData from './vatsim-data';

export default function parseVatsimData(data: string): VatsimData {
  const lines =
    data
      .split(/\r?\n/)
      .filter(line => !line.startsWith(';'));

  const connectedClients = lines
    .map(line => line.match(/^CONNECTED CLIENTS = (\d+)$/))
    .find(match => match !== null)[1];

  const clients = lines
    .slice(lines.findIndex(line => line === '!CLIENTS:') + 1, lines.findIndex(line => line === '!SERVERS:'))
    .map(line => parseClient(line));

  const activeAirports = clients
    .filter(client => isPilot(client))
    .flatMap((pilot: Pilot) => [airports[pilot.from], airports[pilot.to]])
    .filter(airport => !!airport);

  return {
    connectedClients: Number(connectedClients),
    clients,
    activeAirports: [...new Set(activeAirports)],
  };
}
