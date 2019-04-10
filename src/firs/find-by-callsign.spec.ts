import { expect } from 'chai';
import { findByCallsign } from './find-by-callsign';
import { Fir, isFir } from './models';

// tslint:disable: no-unused-expression

describe('findByCallsign()', () => {
  it('finds FIR by direct ICAO match', () => {
    expect(findByCallsign('LPPO_FSS')).to.be.not.null;
  });

  describe('resolves FIR', () => {
    it('by alias, *_CTR', () => {
      const bosCtr = findByCallsign('BOS_CTR');
      expect(bosCtr).to.be.ok;
      expect(bosCtr.icao).to.equal('KZBW');
      expect(isFir(bosCtr)).to.equal(true);
      expect((bosCtr as Fir).oceanic).to.equal(false);

      const chiCtr = findByCallsign('CHI_35_CTR');
      expect(chiCtr).to.be.ok;
      expect(chiCtr.icao).to.equal('KZAU');
      expect(isFir(chiCtr)).to.equal(true);
      expect((chiCtr as Fir).oceanic).to.equal(false);

      const houCtr = findByCallsign('HOU_3A_CTR');
      expect(houCtr).to.be.ok;
      expect(houCtr.icao).to.equal('KZHU');
      expect(isFir(houCtr)).to.equal(true);
      expect((houCtr as Fir).oceanic).to.equal(false);
    });

    it('by alias, *_FSS, oceanic', () => {
      const houFss = findByCallsign('HOU_X_FSS');
      expect(houFss).to.be.ok;
      expect(houFss.icao).to.equal('KZHU Oceanic');
      expect(isFir(houFss)).to.equal(true);
      expect((houFss as Fir).oceanic).to.equal(true);
    });

    it('by ICAO code, *_FSS, oceanic', () => {
      const czeg1Fss = findByCallsign('CZEG_1_FSS');
      expect(czeg1Fss).to.be.ok;
      expect(czeg1Fss.icao).to.equal('CZEG');
      expect(isFir(czeg1Fss)).to.equal(true);
    });

    it('by alias, *_FSS', () => {
      // KZAK probably should be marked as oceanic
      const zakFss = findByCallsign('ZAK_E_FSS');
      expect(zakFss).to.be.ok;
      expect(zakFss.icao).to.equal('KZAK');
      expect(isFir(zakFss)).to.equal(true);
      expect((zakFss as Fir).oceanic).to.equal(false);
    });
  });

  it('finds UIR', () => {
    const adrCtr = findByCallsign('ADR_CTR');
    expect(adrCtr).to.be.ok;
    expect(isFir(adrCtr)).to.equal(false);
  });
});
