import { airportTree, findAirportByIcao } from '../airports';
import { Atc } from './models';

interface Airspace {
  airport?: string;
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
          .nearest({ lon: atc.position.longitude, lat: atc.position.latitude }, 1);
        const [ nearestAirport ] = match[0];
        return { airport: nearestAirport.icao };
      }
  }

  return { };
}
