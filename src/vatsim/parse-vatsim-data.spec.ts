import { expect } from 'chai';
import chai from 'chai';
import chaiArrays from 'chai-arrays';
import chaiDateTime from 'chai-datetime';
import fs from 'fs';
import path from 'path';
import { Pilot, VatsimData } from './models';
import parseVatsimData from './parse-vatsim-data';

before(() => {
  chai.use(chaiArrays);
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

  describe('clients', () => {
    it('are parsed correctly', () => {
      expect(vatsimData.clients).to.be.an('array');
      expect(vatsimData.clients.length).to.equal(vatsimData.general.connectedClients);
    });

    it('flights without flight plan have their departure airport recognized', () => {
      const kx1000 = vatsimData.clients.find(c => c.callsign === 'KX1000');
      // tslint:disable-next-line:no-unused-expression
      expect(kx1000).to.not.be.null;
      expect(kx1000.type).to.equal('pilot');
      // tslint:disable-next-line:no-unused-expression
      expect((kx1000 as Pilot).flightPhase).to.not.be.undefined;
      expect((kx1000 as Pilot).flightPhase).to.equal('departing');
      expect((kx1000 as Pilot).from).to.equal('KIAD');
    });
  });

  describe('active airports', () => {
    it('are discovered', () => {
      expect(vatsimData.activeAirports).to.be.an('array');
      expect(vatsimData.activeAirports.length).to.equal(418);
    });

    it('are in fact active', () => {
      vatsimData.activeAirports.forEach(airport => {
        expect(airport.inboundFlights.length + airport.outboundFlights.length + airport.atcs.length)
          .to.be.greaterThan(0);
      });
    });

    it('recognizes inbound & outbound flights', () => {
      const llbg = vatsimData.activeAirports.find(ap => ap.icao === 'LLBG');
      // tslint:disable-next-line:no-unused-expression
      expect(llbg).to.not.be.null;
      expect(llbg.inboundFlights).to.be.containingAllOf(['ELY384', 'ELY5188', 'ELY542']);
      expect(llbg.outboundFlights).to.be.containingAllOf(['4XEGR']);
    });
  });
});
