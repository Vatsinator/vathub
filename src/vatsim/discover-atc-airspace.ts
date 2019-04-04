import { airportTree, findAirportByIcao } from '../airports';
import { findFirByIcao } from '../firs';
import { Atc } from './models';

interface Airspace {
  airport?: string;
  fir?: string;
}

export function discoverAtcAirspace(atc: Atc): Airspace {
  const icao = atc.callsign.split('_')[0];
  switch (atc.facility) {
    case 'ATIS':
    case 'DEL':
    case 'GND':
    case 'TWR':
    case 'DEP':
    case 'APP':
      const airport = findAirportByIcao(icao);
      if (airport) {
        return { airport: airport.icao };
      } else {
        const match = airportTree
          .nearest({ latitude: atc.position[0], longitude: atc.position[1] }, 1);
        const [ nearestAirport ] = match[0];
        return { airport: nearestAirport.icao };
      }

    case 'CTR':
    case 'FSS':
      const fir = findFirByIcao(icao);
      if (fir) {
        return { fir: fir.icao };
      }
  }

  return { };
}
