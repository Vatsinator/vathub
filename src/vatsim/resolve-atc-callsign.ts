import request from 'request';
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
  if (frequencies) {
    return frequencies;
  } else {
    logger.debug('Downloading frequencies.json');
    frequencies = await rp({ uri: 'http://api.vateud.net/frequencies.json', json: true });
    return frequencies;
  }
}

export async function resolveAtcCallsign(atc: Atc): Promise<string> {
  await fetchFrequencies();
  const entry = frequencies.find(freq => freq.callsign === atc.callsign);
  return entry ? entry.name : null;
}
