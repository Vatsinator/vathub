import { airportTree, findAirportByCallsign } from '../airports';
import { findFirByCallsign, isFir } from '../firs';
import logger from '../logger';
import { Atc } from './models';

interface Airspace {
  airport?: string;
  fir?: string;
  uir?: string;
}

export function discoverAtcAirspace(atc: Atc): Airspace {
  switch (atc.facility) {
    case 'ATIS':
    case 'DEL':
    case 'GND':
    case 'TWR':
    case 'DEP':
    case 'APP':
      const airport = findAirportByCallsign(atc.callsign);
      if (airport) {
        return { airport: airport.icao };
      } else {
        const match = airportTree
          .nearest({ lat: atc.position[0], lon: atc.position[1] }, 1);
        const [ nearestAirport ] = match[0];
        return { airport: nearestAirport.icao };
      }

    case 'CTR':
    case 'FSS':
      const fir = findFirByCallsign(atc.callsign);
      if (fir) {
        return isFir(fir) ? { fir: fir.icao } : { uir: fir.icao };
      } else {
        logger.warn(`Unrecognized ATC: ${atc.callsign}`);
      }
  }

  return { };
}
