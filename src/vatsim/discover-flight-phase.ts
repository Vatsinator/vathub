import { isPointInCircle } from 'geolib';
import { findAirportByIcao } from '../airports';
import { FlightPhase, Pilot } from './models/pilot';
import { PilotIsInAirportRange } from './pilot-is-in-airport-range';

export function discoverFlightPhase(pilot: Pilot): FlightPhase {
  if (pilot.groundSpeed < 50) {
    const dep = findAirportByIcao(pilot.from);
    if (dep) {
      if (isPointInCircle(
        { latitude: pilot.position[0], longitude: pilot.position[1] },
        { latitude: dep.lat, longitude: dep.lon }, PilotIsInAirportRange)) {
        return 'departing';
      }
    }

    const dest = findAirportByIcao(pilot.to);
    if (dest) {
      if (isPointInCircle(
        { latitude: pilot.position[0], longitude: pilot.position[1] },
        { latitude: dest.lat, longitude: dest.lon }, PilotIsInAirportRange)) {
        return 'arrived';
      }
    }
  }

  return 'airborne';
}
