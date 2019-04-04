import airportList from './airports.json';
import { Airport } from './models';

export const airportMap: Map<string, Airport> = new Map(Object.entries(airportList));
