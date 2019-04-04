import { getTargets } from '../aliases';
import { firMap } from './fir-map';
import { Fir } from './models';

export function findByIcao(icao: string): Fir | null {
  if (firMap.has(icao)) {
    return firMap.get(icao);
  }

  const targets = getTargets(icao);
  for (const target of targets) {
    if (firMap.has(target)) {
      return firMap.get(target);
    }
  }

  return null;
}
