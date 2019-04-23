import { existsSync, writeFileSync } from 'fs';
import path from 'path';
import rp from 'request-promise';
import { findAirportByIcao } from '../airports';
import logger from '../logger';
import { Atc } from './models';

// http://api.vateud.net/frequencies
interface AtcFrequency {
  callsign: string;
  freq: string;
  name: string;
}

let frequencies: AtcFrequency[];

async function fetchFrequencies() {
  const cachePath = path.join(__dirname, '..', '..', 'cache', 'frequencies.json');
  if (frequencies) {
    return frequencies;
  } else if (existsSync(cachePath)) {
    frequencies = require(cachePath);
    logger.debug(`Read ${cachePath}`);
    return frequencies;
  } else {
    logger.debug('Downloading frequencies.json');
    frequencies = await rp({ uri: 'http://api.vateud.net/frequencies.json', json: true });
    writeFileSync(cachePath, JSON.stringify(frequencies));
    logger.debug(`Cache written to ${cachePath}`);
    return frequencies;
  }
}

function fromAirport(icao: string) {
  if (!icao) {
    throw new Error('invalid icao');
  }

  const airport = findAirportByIcao(icao);
  if (!airport) {
    throw new Error('invalid airport');
  }

  if (airport.city !== airport.name) {
    return `${airport.city}/${airport.name}`;
  } else {
    return airport.city;
  }
}

function resolveAuto(atc: Atc): string {
  switch (atc.facility) {
    case 'ATIS':
      return `${fromAirport(atc.airport)} ATIS`;
    case 'DEL':
      return `${fromAirport(atc.airport)} Delivery`;
    case 'GND':
      return `${fromAirport(atc.airport)} Ground`;
    case 'TWR':
      return `${fromAirport(atc.airport)} Tower`;
    case 'APP':
      return `${fromAirport(atc.airport)} Approach`;
    default:
      return null;
  }
}

export async function resolveAtcCallsign(atc: Atc): Promise<string> {
  const freqs = await fetchFrequencies();
  const entry = freqs.find(freq => freq.callsign === atc.callsign);
  return entry ? entry.name : resolveAuto(atc);
}
