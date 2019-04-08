import { expect } from 'chai';
import { findByCallsign } from './find-by-callsign';

// tslint:disable: no-unused-expression

describe('findByCallsign()', () => {
  it('finds FIR by direct ICAO match', () => {
    expect(findByCallsign('LPPO_FSS')).to.be.not.null;
  });

  it('finds FIR by an alias', () => {
      const bosCtr = findByCallsign('BOS_CTR');
      expect(bosCtr).to.be.ok;
      expect(bosCtr.icao).to.equal('KZBW');
      expect(bosCtr.oceanic).to.equal(false);

      const chiCtr = findByCallsign('CHI_35_CTR');
      expect(chiCtr).to.be.ok;
      expect(chiCtr.icao).to.equal('KZAU');
      expect(chiCtr.oceanic).to.equal(false);

      const houCtr = findByCallsign('HOU_3A_CTR');
      expect(houCtr).to.be.ok;
      expect(houCtr.icao).to.equal('KZHU');
      expect(houCtr.oceanic).to.equal(false);

      const houFss = findByCallsign('HOU_X_FSS');
      expect(houFss).to.be.ok;
      expect(houFss.icao).to.equal('KZHU Oceanic');
      expect(houFss.oceanic).to.equal(true);
  });
});
