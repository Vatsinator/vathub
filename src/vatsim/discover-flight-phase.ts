import { isPointWithinRadius } from 'geolib';
import { findAirportByIcao } from '../airports';
import { FlightPhase, Pilot } from './models/pilot';
import { PilotIsInAirportRange } from './pilot-is-in-airport-range';

export function discoverFlightPhase(pilot: Pilot): FlightPhase {
  if (pilot.groundSpeed < 50) {
    const dep = findAirportByIcao(pilot.from);
    if (dep) {
      if (isPointWithinRadius(
        { latitude: pilot.position[0], longitude: pilot.position[1] },
        { latitude: dep.position[0], longitude: dep.position[1] }, PilotIsInAirportRange)) {
        return 'departing';
      }
    }

    const dest = findAirportByIcao(pilot.to);
    if (dest) {
      if (isPointWithinRadius(
        { latitude: pilot.position[0], longitude: pilot.position[1] },
        { latitude: dest.position[0], longitude: dest.position[1] }, PilotIsInAirportRange)) {
        return 'arrived';
      }
    }
  }

  return 'airborne';
}
