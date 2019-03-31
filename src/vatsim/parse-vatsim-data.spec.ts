import { expect } from 'chai';
import chai from 'chai';
import chaiDateTime from 'chai-datetime';
import fs from 'fs';
import path from 'path';
import { VatsimData } from './models';
import parseVatsimData from './parse-vatsim-data';

before(() => {
  chai.use(chaiDateTime);
});

describe('parseVatsimData()', () => {
  let vatsimData: VatsimData;

  beforeEach(() => {
    const filePath = path.join(__dirname, 'vatsim-data.txt');
    const data = fs.readFileSync(filePath);
    vatsimData = parseVatsimData(data.toString());
  });

  it('returns non-null object', () => {
    // tslint:disable-next-line:no-unused-expression
    expect(vatsimData).to.be.not.null;
  });

  it('parses general data', () => {
    expect(vatsimData.general.version).to.equal(8);
    expect(vatsimData.general.reload).to.equal(2);
    expect(vatsimData.general.update).to.equalDate(new Date('2019-03-30T20:03:01.000Z'));
    expect(vatsimData.general.atisAllowMin).to.equal(5);
    expect(vatsimData.general.connectedClients).to.equal(1351);
  });
});
