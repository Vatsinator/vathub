import { expect } from 'chai';
import chai from 'chai';
import chaiArrays from 'chai-arrays';
import chaiDateTime from 'chai-datetime';
import fs from 'fs';
import path from 'path';
import { Atc, Pilot, VatsimData } from './models';
import parseVatsimData from './parse-vatsim-data';

// tslint:disable:no-unused-expression

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
      expect(kx1000).to.not.be.null;
      expect(kx1000.type).to.equal('pilot');
      expect((kx1000 as Pilot).flightPhase).to.not.be.undefined;
      expect((kx1000 as Pilot).flightPhase).to.equal('departing');
      expect((kx1000 as Pilot).from).to.equal('KIAD');
    });

    it('atcs have FIRs recognized', () => {
      const atc = vatsimData.clients.find(c => c.callsign === 'CZQX_1_CTR');
      expect(atc).to.not.be.null;
      expect(atc.type).to.equal('atc');
      expect(atc).to.have.property('fir');
      expect((atc as Atc).fir).to.equal('CZQX');
    });
  });

  describe('active airports', () => {
    it('are discovered', () => {
      expect(vatsimData.activeAirports).to.be.an('array');
    });

    it('are in fact active', () => {
      vatsimData.activeAirports.forEach(airport => {
        expect(airport.inboundFlights.length + airport.outboundFlights.length + airport.atcs.length)
          .to.be.greaterThan(0);
      });
    });

    it('recognizes inbound & outbound flights', () => {
      const llbg = vatsimData.activeAirports.find(ap => ap.icao === 'LLBG');
      expect(llbg).to.not.be.null;
      expect(llbg.inboundFlights).to.be.containingAllOf(['ELY384', 'ELY5188', 'ELY542']);
      expect(llbg.outboundFlights).to.be.containingAllOf(['4XEGR']);
    });
  });
});
