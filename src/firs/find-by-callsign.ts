import { firList } from './fir-list';
import { Fir } from './models';

export function findByCallsign(callsign: string): Fir {
  return firList.find(fir => callsign.startsWith(fir.icao) ||
    !!fir.prefix.find(prefix => callsign.startsWith(prefix)) ||
    !!fir.alias.find(alias => callsign.startsWith(alias)));
}
