import rp from 'request-promise';
import logger from '../logger';
import { VatsimData, VatsimStatus } from './models';
import parseVatsimData from './parse-vatsim-data';
import parseVatsimStatus from './parse-vatsim-status';

class VatsimTracker {
  public status: VatsimStatus;
  public data: VatsimData;

  constructor() {
    this.fetchStatus();
  }

  private async fetchStatus() {
    try {
      const body = await rp('https://status.vatsim.net');
      this.status = parseVatsimStatus(body);
      logger.debug('VATSIM status downloaded');
      this.fetchData();
    } catch (error) {
      logger.error(`could not download VATSIM status file; message: ${error.message}`);
      setTimeout(() => this.fetchStatus(), 5000); // try again in 5 seconds
    }
  }

  private async fetchData() {
    const url = this.status.dataUrls[Math.floor(Math.random() * this.status.dataUrls.length)];
    logger.debug(`Downloading ${url}`);
    try {
      const body = await rp(url);
      const start = new Date().getTime();
      this.data = await parseVatsimData(body);
      const end = new Date().getTime() - start;
      logger.debug('Parsing VATSIM data took %dms', end);

      setTimeout(() => this.fetchData(), 60 * 1000); // refresh data every 1 minute
    } catch (error) {
      logger.error(`could not download VATSIM data file; message: ${error.message}`);
      setTimeout(() => this.fetchData(), 5000); // try again in 5 seconds
    }
  }
}

export default new VatsimTracker();
