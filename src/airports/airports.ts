import { Airport } from './models/airport';

// tslint:disable-next-line:no-var-requires
const airports = require('airports.json');

export default airports as { [icao: string]: Airport };
