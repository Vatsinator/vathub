import kdTree = require('kd-tree-javascript');
import { airportMap } from './airport-map';
import { Airport } from './models/airport';

const distance = (a: Airport, b: Airport) => {
  return Math.pow(a.lon - b.lon, 2) + Math.pow(a.lat - b.lat, 2);
};

export const airportTree = new kdTree.kdTree([...airportMap.values()], distance, ['lon', 'lat']);
