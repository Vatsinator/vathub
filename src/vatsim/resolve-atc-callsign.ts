import { existsSync, writeFileSync } from 'fs';
import path from 'path';
import rp from 'request-promise';
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

export async function resolveAtcCallsign(atc: Atc): Promise<string> {
  const freqs = await fetchFrequencies();
  const entry = freqs.find(freq => freq.callsign === atc.callsign);
  return entry ? entry.name : null;
}
