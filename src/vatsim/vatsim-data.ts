import Client from './models/client';

export default interface VatsimData {
  connectedClients: number;
  clients: Client[];
}
