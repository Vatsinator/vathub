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
