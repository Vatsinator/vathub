import moment from 'moment';
import { airportMap, airportTree } from '../airports';
import { findByIcao } from '../airports';
import { discoverFlightPhase } from './discover-flight-phase';
import { Atc, isAtc, isPilot, Pilot, VatsimData } from './models';
import parseClient from './parse-client';
import { PilotIsInAirportRange } from './pilot-is-in-airport-range';

/** For pilots that have not filled a flight plan yet, try to find out where they are */
function findDepartureAirport(pilot: Pilot): void {
  if (!pilot.from) { // no flight plan
    const match = airportTree.nearest({ lon: pilot.position.longitude, lat: pilot.position.latitude }, 1);
    const [ airport, distance ] = match[0];
    const R = 6371e3; // meters
    if (distance * R < PilotIsInAirportRange) {
      pilot.from = airport.icao;
    }
  }
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
          .nearest({ lon: atc.position.longitude, lat: atc.position.latitude }, 1);
        const [ airport ] = match[0];
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
  clients.filter(client => isPilot(client)).forEach((pilot: Pilot) => pilot.flightPhase = discoverFlightPhase(pilot));
  clients.filter(client => isAtc(client)).forEach((atc: Atc) => discoverAtcPosition(atc));

  const activeAirports = [ ...new Set(clients // remove duplicates
    .reduce((acc, client) => {
      if (isAtc(client)) {
        return acc.concat([ client.airport ]);
      } else if (isPilot(client)) {
        return acc.concat([ client.from, client.to ]);
      }
    }, [])
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
