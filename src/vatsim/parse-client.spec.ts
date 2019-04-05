import { expect } from 'chai';
import { Atc, isAtc, isPilot, Pilot } from './models';
import parseClient from './parse-client';

describe('parseClient()', () => {
  describe('atc', () => {
    let atc: Atc;

    beforeEach(() => {
      // tslint:disable-next-line:max-line-length
      const line = 'ATL_APP:1090147:Michael Thomas:ATC:127.900:33.63670:-84.42786:0:::0::::USA-S:100:5::5:150::::::::::::::::::20190330201750::::';
      atc = parseClient(line) as Atc;
    });

    it('is recognized', () => {
      expect(atc.type).to.equal('atc');
      // tslint:disable-next-line:no-unused-expression
      expect(isAtc(atc)).to.be.true;
    });

    it('is parsed correctly', () => {
      expect(atc.callsign).to.equal('ATL_APP');
      expect(atc.cid).to.equal(1090147);
      expect(atc.name).to.equal('Michael Thomas');
      expect(atc.position).to.deep.equal([33.6367, -84.42786]);
      expect(atc.frequency).to.equal('127.900');
      expect(atc.rating).to.equal(5);
      expect(atc.facility).to.equal('APP');
    });
  });

  describe('pilot', () => {
    let pilot: Pilot;

    beforeEach(() => {
      // tslint:disable-next-line:max-line-length
      const line = '04246:904310:Anton A. Pavlov OMAA:PILOT::60.69702:37.71265:8650:169:SF34/G:150:ULPB:A090:UUYY:GERMANY2:100:1:7000:::2:V:2020:2020:2:15:3:5:ULKK:+VFPS+/T/RMK/CALLSIGN AIREST CARGO REG/ESLSC OPR/WWW.BALTIC-VA.ORG:N0150A090 SELGA DCT KEGUP B158 GARSI A720 DIBLU G908 OTLAS R959 ESAPA R492 ADISA R22 ADKOL:0:0:0:0:::20190330200005:85:29.572:1001:';
      pilot = parseClient(line) as Pilot;
    });

    it('is recognized', () => {
      expect(pilot.type).to.equal('pilot');
      // tslint:disable-next-line:no-unused-expression
      expect(isPilot(pilot)).to.be.true;
    });

    it('is parsed correctly', () => {
      expect(pilot.callsign).to.equal('04246');
      expect(pilot.cid).to.equal(904310);
      expect(pilot.name).to.equal('Anton A. Pavlov OMAA');
      expect(pilot.position).to.deep.equal([60.69702, 37.71265]);
      expect(pilot.aircraft).to.equal('SF34/G');
      expect(pilot.heading).to.equal(85);
      expect(pilot.from).to.equal('ULPB');
      expect(pilot.to).to.equal('UUYY');
      expect(pilot.groundSpeed).to.equal(169);
    });
  });

  it('handles malformed lines', () => {
    expect(parseClient('')).to.equal(null);
    expect(parseClient('::::::::::::::::::::::::::::::::::::::::::')).to.equal(null);
    expect(parseClient('::::::::::::::::::::::::::::::::::::::::')).to.equal(null);
  });

  it('handles invalid client position', () => {
    const client = parseClient(':::PILOT::::::::::::::::::::::::::::::::::::::');
    expect(client).to.equal(null);
  });

  it('handles invalid client types', () => {
    const client = parseClient(':::FOO::60.69702:37.71265:::::::::::::::::::::::::::::::::::');
    expect(client).to.equal(null);
  });
});
