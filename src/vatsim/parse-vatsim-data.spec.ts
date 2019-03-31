import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { VatsimData } from './models';
import parseVatsimData from './parse-vatsim-data';

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
});
