import { Airport } from 'airports';

export interface ActiveAirport extends Airport {
  inboundFlights: string[];
  outboundFlights: string[];
  atcs?: string[];
}
