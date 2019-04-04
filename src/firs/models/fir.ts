import { LatLng } from '../../vatsim/models';

export interface Fir {
  icao: string;
  name: string;
  country: string;
  oceanic: boolean;
  border: LatLng[][];
  labelPosition: LatLng;
}
