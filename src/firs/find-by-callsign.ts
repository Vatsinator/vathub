import { firList } from './fir-list';
import { Fir } from './models';

export function findByCallsign(callsign: string): Fir {
  const data = callsign.split('_');
  const prefix = data[0];
  const facility = data[data.length - 1];
  let isOceanic: boolean;

  switch (facility) {
    case 'CTR':
      isOceanic = false;
      break;

    case 'FSS':
      isOceanic = true;
      break;

    default:
      throw new Error('invalid callsign');
  }

  const key = isOceanic ? `${prefix} Oceanic` : prefix;

  return firList.find(fir => fir.icao === key ||
    fir.oceanic === isOceanic && (
      !!fir.alias.find(a => a === prefix) ||
      !!fir.prefix.find(p => p === prefix)
    ));
}
