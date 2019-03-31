import { Airport } from './models/airport';

// tslint:disable-next-line: no-var-requires
export const airportMap: { [icao: string]: Airport } = require('./airports.json');
