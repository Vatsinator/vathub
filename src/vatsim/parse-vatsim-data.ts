import { isPointInCircle } from 'geolib';
import moment from 'moment';
import { Airport, airportMap, airportTree } from '../airports';
import { isPilot, Pilot, VatsimData } from './models';
import parseClient from './parse-client';

function findPilotAirports(pilot: Pilot): Airport[] {
  let dep: Airport;
  if (!pilot.from) { // no flight plan
    const match = airportTree.nearest({ lon: pilot.position.longitude, lat: pilot.position.latitude }, 1);
    const [ airport, distance ] = match[0];
    const R = 3440.06479191; // nm
    if (distance * R < 2.0) {
      dep = airport;
      pilot.from = dep.icao;
    }
  } else {
    dep = airportMap[pilot.from];
  }

  return [ dep, airportMap[pilot.to] ];
}

function discoverFlightPhase(pilot: Pilot): void {
  if (pilot.groundSpeed < 50) {
    // The most spacious airport in the world is the King Fahd International Airport; its
    // area is 776 square kilometers, which gives us a circle with range of about
    // 15716 meters.
    const PilotIsAtAirportRange = 15716;

    const dep = airportMap[pilot.from];
    if (dep) {
      if (isPointInCircle(pilot.position, { latitude: dep.lat, longitude: dep.lon }, PilotIsAtAirportRange)) {
        pilot.flightPhase = 'departing';
        return;
      }
    }

    const dest = airportMap[pilot.to];
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

  const version = lines
    .map(line => line.match(/^VERSION = (\d+)$/))
    .find(match => match !== null)[1];

  const reload = lines
    .map(line => line.match(/^RELOAD = (\d+)$/))
    .find(match => match !== null)[1];

  const update = lines
    .map(line => line.match(/^UPDATE = (\d+)$/))
    .find(match => match !== null)[1];

  const atisAllowMin = lines
    .map(line => line.match(/^ATIS ALLOW MIN = (\d+)$/))
    .find(match => match !== null)[1];

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
    general: {
      version: parseInt(version, 10),
      reload: parseInt(reload, 10),
      update: moment(update, 'YYYYMMDDHHmmss').toDate(),
      atisAllowMin: parseInt(atisAllowMin, 10),
      connectedClients: parseInt(connectedClients, 10),
    },
    clients,
    activeAirports: [...new Set(activeAirports)], // get rid of duplicates
  };
}
