import { isPointInCircle } from 'geolib';
import moment from 'moment';
import { Airport, airportMap, airportTree } from '../airports';
import { findByIcao } from '../airports';
import { Atc, isAtc, isPilot, Pilot, VatsimData } from './models';
import parseClient from './parse-client';

// Maximum distance for the pilot to be away from an airport reference point to be
// considered at the airport.
// The most spacious airport in the world is the King Fahd International Airport; its
// area is 776 square kilometers, which gives us a circle with range of about
// 15716 meters.
const PilotIsAtAirportRange = 15716;

/** For pilots that have not filled a flight plan yet, try to find out where they are */
function findDepartureAirport(pilot: Pilot): void {
  if (!pilot.from) { // no flight plan
    const match = airportTree.nearest({ lon: pilot.position.longitude, lat: pilot.position.latitude }, 1);
    const [ airport, distance ] = match[0];
    const R = 6371e3; // meters
    if (distance * R < PilotIsAtAirportRange) {
      pilot.from = airport.icao;
    }
  }
}

function discoverFlightPhase(pilot: Pilot): void {
  if (pilot.groundSpeed < 50) {
    const dep = findByIcao(pilot.from);
    if (dep) {
      if (isPointInCircle(pilot.position, { latitude: dep.lat, longitude: dep.lon }, PilotIsAtAirportRange)) {
        pilot.flightPhase = 'departing';
        return;
      }
    }

    const dest = findByIcao(pilot.to);
    if (dest) {
      if (isPointInCircle(pilot.position, { latitude: dest.lat, longitude: dest.lon }, PilotIsAtAirportRange)) {
        pilot.flightPhase = 'arrived';
        return;
      }
    }
  }

  pilot.flightPhase = 'airborne';
}

function discoverAtcPosition(atc: Atc): void {
  const icao = atc.callsign.split('_')[0];
  switch (atc.facility) {
    case 'ATIS':
    case 'DEL':
    case 'GND':
    case 'TWR':
    case 'DEP':
    case 'APP':
      if (findByIcao(icao)) {
        atc.airport = icao;
      } else {
        const match = airportTree
          .nearest({ lon: atc.position.longitude, lat: atc.position.latitude }, 100)
          .find(([ap]) => !!ap.iata);
        const [ airport ] = match;
        atc.airport = airport.icao;
      }
      break;
  }
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
    .map(line => parseClient(line))
    // Empty position may sometimes happen, but it appears to happen for clients who just logged into vatsim
    // and is corrected with the very next update
    .filter(client => !isNaN(client.position.latitude) && !isNaN(client.position.longitude));

  clients.filter(client => isPilot(client)).forEach((pilot: Pilot) => findDepartureAirport(pilot));
  clients.filter(client => isPilot(client)).forEach((pilot: Pilot) => discoverFlightPhase(pilot));
  clients.filter(client => isAtc(client)).forEach((atc: Atc) => discoverAtcPosition(atc));

  const activeAirports = [ ...new Set(clients // remove duplicates
    .flatMap(client => {
      if (isAtc(client)) {
        return [ client.airport ];
      } else if (isPilot(client)) {
        return [ client.from, client.to ];
      }
    })
    .filter(icao => !!icao)) ]
    .map(icao => airportMap[icao])
    .filter(airport => !!airport)
    .map(airport => {
      const inboundFlights = clients
        .filter(client => isPilot(client) && client.to === airport.icao)
        .map(c => c.callsign);
      const outboundFlights = clients
        .filter(client => isPilot(client) && client.from === airport.icao)
        .map(c => c.callsign);
      const atcs = clients
        .filter(client => isAtc(client) && client.airport === airport.icao)
        .map(c => c.callsign);

      return { ...airport, inboundFlights, outboundFlights, atcs };
    });

  return {
    general: {
      version: parseInt(version, 10),
      reload: parseInt(reload, 10),
      update: moment(update, 'YYYYMMDDHHmmss').toDate(),
      atisAllowMin: parseInt(atisAllowMin, 10),
      connectedClients: parseInt(connectedClients, 10),
    },
    clients, activeAirports,
  };
}
