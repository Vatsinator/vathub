import { airportList } from './airport-list';
import { Airport } from './models';

export function findByIcao(icao: string): Airport {
  return airportList.find(airport => airport.icao === icao);
}
