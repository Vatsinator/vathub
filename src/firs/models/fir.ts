import { Uir } from '.';
import { LatLng } from '../../vatsim/models';

export interface Fir {
  icao: string;
  name: string;
  prefix: string[];
  alias: string[];
  boundaries: LatLng[][];
  country?: string;
  labelPosition: LatLng;
  oceanic: boolean;
}

export function isFir(fir: Fir | Uir): fir is Fir {
  return fir.hasOwnProperty('boundaries');
}
