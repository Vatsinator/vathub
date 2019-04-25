import async from 'async';
import moment from 'moment';
import { airportTree, findAirportByIcao } from '../airports';
import { discoverAtcAirspace } from './discover-atc-airspace';
import { discoverFlightPhase } from './discover-flight-phase';
import { Atc, isAtc, isPilot, Pilot, VatsimData } from './models';
import parseClient from './parse-client';
import { PilotIsInAirportRange } from './pilot-is-in-airport-range';
import { resolveAtcCallsign } from './resolve-atc-callsign';

/** For pilots that have not filled a flight plan yet, try to find out where they are */
function findDepartureAirport(pilot: Pilot): void {
  if (!pilot.from) { // no flight plan
    const match = airportTree.nearest({ lat: pilot.position[0], lon: pilot.position[1] }, 1);
    const [ airport, distance ] = match[0];
    const R = 6371e3; // meters
    if (distance * R < PilotIsInAirportRange) {
      pilot.from = airport.icao;
    }
  }
}

export default async function parseVatsimData(data: string): Promise<VatsimData> {
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
    .filter(client => !!client);

  clients.filter(client => isPilot(client)).forEach((pilot: Pilot) => findDepartureAirport(pilot));
  clients.filter(client => isPilot(client)).forEach((pilot: Pilot) => pilot.flightPhase = discoverFlightPhase(pilot));
  clients
    .filter(client => isAtc(client))
    .forEach((atc: Atc) => {
      const airspace = discoverAtcAirspace(atc);
      Object.assign(atc, airspace);
    });

  async.eachSeries(clients.filter(client => isAtc(client)), async (atc: Atc, cb) => {
    const callsign = await resolveAtcCallsign(atc);
    if (callsign) {
      atc.resolvedCallsign = callsign;
    }
    return cb();
  });

  const activeAirports = [ ...new Set(clients // remove duplicates
    .reduce((acc, client) => {
      if (isAtc(client)) {
        return acc.concat([ client.airport ]);
      } else if (isPilot(client)) {
        return acc.concat([ client.from, client.to ]);
      }
    }, [])
    .filter(icao => !!icao)) ]
    .map(icao => findAirportByIcao(icao))
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
