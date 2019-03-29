import fs from 'fs';
import path from 'path';
import parseVatsimData from './parse-vatsim-data';
import parseVatsimStatus from './parse-vatsim-status';
import VatsimData from './vatsim-data';
import VatsimStatus from './vatsim-status';

class VatsimTracker {
  public status: VatsimStatus = new VatsimStatus([]);
  public data: VatsimData = {
    connectedClients: 0,
    clients: [],
    activeAirports: [],
  };

  constructor() {
    this.readStatus();
    this.readData();
  }

  private readStatus() {
    const filePath = path.join(__dirname, 'status.txt');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }

      this.status = parseVatsimStatus(data.toString());
    });
  }

  private readData() {
    const filePath = path.join(__dirname, 'vatsim-data.txt');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }

      const start = new Date().getTime();
      this.data = parseVatsimData(data.toString());
      const end = new Date().getTime() - start;
      console.info('Parsing VATSIM data took %dms', end);
    });
  }
}

export default new VatsimTracker();
