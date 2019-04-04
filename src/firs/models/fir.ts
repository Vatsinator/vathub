export interface Fir {
  icao: string;
  name: string;
  country: string;
  oceanic: boolean;
  border: Array<{ latitude: number; longitude: number }> | Array<Array<{ latitude: number; longitude: number }>>;
  labelPosition: { latitude: number; longitude: number };
}
