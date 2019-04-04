export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  state: string;
  country: string;
  elevation: number;
  // TODO Make this [lat, lon] tuple, just like in the Client interface
  lat: number;
  lon: number;
  tz: string;
}
