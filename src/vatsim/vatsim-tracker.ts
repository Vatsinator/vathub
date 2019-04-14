import request from 'request';
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

  private fetchStatus() {
    request('https://status.vatsim.net/', (error, response, body) => {
      if (error) {
        logger.error(`could not download vatsim status file; error code = ${response.statusCode}`);
        setTimeout(() => this.fetchStatus(), 5000); // try again in 5 seconds
        return;
      }

      this.status = parseVatsimStatus(body);
      this.fetchData();
    });
  }

  private async fetchData() {
    const url = this.status.dataUrls[Math.floor(Math.random() * this.status.dataUrls.length)];
    logger.info(`Downloading ${url}...`);
    request(url, async (error, response, body) => {
      if (error) {
        logger.error(`could not download vatsim data file (${url}); error code = ${response.statusCode}`);
        setTimeout(() => this.fetchData(), 5000); // try again in 5 seconds
        return;
      }

      const start = new Date().getTime();
      this.data = await parseVatsimData(body);
      const end = new Date().getTime() - start;
      logger.info('Parsing VATSIM data took %dms', end);

      setTimeout(() => this.fetchData(), this.data.general.reload * 60 * 1000);
    });
  }
}

export default new VatsimTracker();
