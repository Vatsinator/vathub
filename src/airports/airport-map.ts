import { Airport } from './models';

import raw from './airports.json';
export const airportMap: { [icao: string]: Airport } = raw;
