import kdTree = require('kd-tree-javascript');
import { airportList } from './airport-list';

const distance = (a: { lon: number; lat: number; }, b: { lon: number; lat: number; }) => {
  return Math.pow(a.lon - b.lon, 2) + Math.pow(a.lat - b.lat, 2);
};

export const airportTree = new kdTree.kdTree(
  airportList
    .map(airport => (
      {
        ...airport,
        lat: airport.position[0],
        lon: airport.position[1],
      }
    ),
  ), distance, ['lon', 'lat']);
