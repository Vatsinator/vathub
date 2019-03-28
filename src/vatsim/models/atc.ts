import Client from './client';

export interface Atc extends Client {
  frequency: string;
}

export function isAtc(client: Client): client is Atc {
  return client.type === 'atc';
}
