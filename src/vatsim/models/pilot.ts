import Client from './client';

export type FlightPhase = 'departing' | 'airborne' | 'arrived';

export interface Pilot extends Client {
  aircraft: string;
  heading: number;
  from: string;
  to: string;
  groundSpeed: number;
  flightPhase?: FlightPhase;
}

export function isPilot(client: Client): client is Pilot {
  return client.type === 'pilot';
}
