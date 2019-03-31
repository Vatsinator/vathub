import { Airport } from 'airports/models';
import { Client } from './client';

/**
 * Parsed & processed vatsim-data.txt file.
 */
export interface VatsimData {
  general: {
    /** This data format version */
    version: number;
    /** Time in minutes VATSIM data will be updated */
    reload: number;
    /** The last date and time VATSIM data has been updated */
    update: Date;
    /** Time in minutes to wait before allowing manual Atis refresh by way of web page interface */
    atisAllowMin: number;
    /** The number of clients currently connected */
    connectedClients: number;
  };
  /** All parsed clients - pilots and ATCs */
  clients: Client[];
  /** Airports with inbound/outbound flights and ATCs online */
  activeAirports: Airport[];
}
