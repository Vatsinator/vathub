import { getTargets } from '../aliases';
import { airportMap } from './airport-map';
import { Airport } from './models';

export function findByIcao(icao: string): Airport | null {
  if (airportMap.has(icao)) {
    return airportMap.get(icao);
  }

  const targets = getTargets(icao);
  for (const target of targets) {
    if (airportMap.has(target)) {
      return airportMap.get(target);
    }
  }

  return null;
}
