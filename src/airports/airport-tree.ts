import kdTree = require('kd-tree-javascript');
import airports from './airports';
import { Airport } from './models/airport';

// declare var kdTree: any;

const distance = (a: Airport, b: Airport) => {
  return Math.pow(a.lon - b.lon, 2) + Math.pow(a.lat - b.lat, 2);
};

const airportTree = new kdTree.kdTree(Object.values(airports), distance, ['lon', 'lat']);
export default airportTree;
