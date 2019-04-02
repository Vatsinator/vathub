import { getTargets } from '../aliases';
import { airportMap } from './airport-map';
import { Airport } from './models';

export function findByIcao(icao: string): Airport | null {
  if (airportMap[icao]) {
    return airportMap[icao];
  }

  const targets = getTargets(icao);
  for (const target of targets) {
    if (airportMap[target]) {
      return airportMap[target];
    }
  }

  return null;
}
