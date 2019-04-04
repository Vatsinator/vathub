import firList from './firs.json';
import { Fir } from './models';

export const firMap: Map<string, Fir> = new Map(firList.map(fir => [fir.icao, fir] as [string, Fir]));
