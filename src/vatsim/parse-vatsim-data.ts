import Client from './models/client';
import parseClient from './parse-client';
import VatsimData from './vatsim-data';

function retrieveClients(lines: string[]): Client[] {
  return lines
    .slice(lines.findIndex(line => line === '!CLIENTS:') + 1, lines.findIndex(line => line === '!SERVERS:'))
    .map(line => parseClient(line));
}

export default function parseVatsimData(data: string): VatsimData {
  const lines =
    data
      .split(/\r?\n/)
      .filter(line => !line.startsWith(';'));

  const connectedClients = lines
    .map(line => line.match(/^CONNECTED CLIENTS = (\d+)$/))
    .find(match => match !== null)[1];

  return {
    connectedClients: Number(connectedClients),
    clients: retrieveClients(lines) };
}
