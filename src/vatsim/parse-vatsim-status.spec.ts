import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { VatsimStatus } from './models';
import parseVatsimStatus from './parse-vatsim-status';

describe('parseVatsimStatus()', () => {
  let status: VatsimStatus;

  beforeEach(() => {
    const filePath = path.join(__dirname, 'status.txt');
    const data = fs.readFileSync(filePath);
    status = parseVatsimStatus(data.toString());
  });

  it('returns non-null object', () => {
    // tslint:disable-next-line:no-unused-expression
    expect(status).to.not.be.null;
  });

  it('parses data urls', () => {
    expect(status.dataUrls.length).to.equal(3);
    expect(status.dataUrls[0]).to.equal('http://vatsim-data.hardern.net/vatsim-data.txt');
    expect(status.dataUrls[1]).to.equal('http://info.vroute.net/vatsim-data.txt');
    expect(status.dataUrls[2]).to.equal('http://data.vattastic.com/vatsim-data.txt');
  });

  it('parses metar url', () => {
    expect(status.metarUrl).to.equal('http://metar.vatsim.net/metar.php');
  });
});
