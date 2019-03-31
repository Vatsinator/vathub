import { isPointInCircle } from 'geolib';
import airportTree from '../airports/airport-tree';
import airports from '../airports/airports';
import { Airport } from '../airports/models/airport';
import { isPilot, Pilot } from './models/pilot';
import parseClient from './parse-client';
import VatsimData from './vatsim-data';

function findPilotAirports(pilot: Pilot): Airport[] {
  let dep: Airport;
  if (!pilot.from) { // no flight plan
    const match = airportTree.nearest({ lon: pilot.position.longitude, lat: pilot.position.latitude }, 1);
    const [ airport, distance ] = match[0];
    const R = 3440.06479191; // nm
    if (distance * R < 2.0) {
      console.info(`${pilot.callsign} has no flight plan, the nearest airport is ${airport.icao}`);
      dep = airport;
      pilot.from = dep.icao;
    } else {
      console.warn(`${pilot.callsign} has no flight plan`);
    }
  } else {
    dep = airports[pilot.from];
  }

  return [ dep, airports[pilot.to] ];
}

function discoverFlightPhase(pilot: Pilot): void {
  if (pilot.groundSpeed < 50) {
    // The most spacious airport in the world is the King Fahd International Airport; its
    // area is 776 square kilometers, which gives us a circle with range of about
    // 15716 meters.
    const PilotIsAtAirportRange = 15716;

    const dep = airports[pilot.from];
    if (dep) {
      if (isPointInCircle(pilot.position, { latitude: dep.lat, longitude: dep.lon }, PilotIsAtAirportRange)) {
        pilot.flightPhase = 'departing';
        return;
      }
    }

    const dest = airports[pilot.to];
    if (dest) {
      if (isPointInCircle(pilot.position, { latitude: dest.lat, longitude: dest.lon }, PilotIsAtAirportRange)) {
        pilot.flightPhase = 'arrived';
        return;
      }
    }
  }

  pilot.flightPhase = 'airborne';
}

export default function parseVatsimData(data: string): VatsimData {
  const lines =
    data
      .split(/\r?\n/)
      .filter(line => !line.startsWith(';'));

  const connectedClients = lines
    .map(line => line.match(/^CONNECTED CLIENTS = (\d+)$/))
    .find(match => match !== null)[1];

  const clients = lines
    .slice(lines.findIndex(line => line === '!CLIENTS:') + 1, lines.findIndex(line => line === '!SERVERS:'))
    .map(line => parseClient(line));

  const activeAirports = clients
    .filter(client => isPilot(client))
    .flatMap((pilot: Pilot) => findPilotAirports(pilot))
    .filter(airport => !!airport);

  clients.filter(client => isPilot(client)).forEach((pilot: Pilot) => discoverFlightPhase(pilot));

  return {
    connectedClients: Number(connectedClients),
    clients,
    activeAirports: [...new Set(activeAirports)], // get rid of duplicates
  };
}
