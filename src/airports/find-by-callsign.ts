import { airportList } from './airport-list';
import { Airport } from './models';

export function findByCallsign(callsign: string): Airport {
  const prefix = callsign.split('_')[0];

  return airportList.find(airport =>
    airport.icao === prefix ||
    airport.alias === prefix);
}
