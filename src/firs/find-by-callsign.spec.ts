import { expect } from 'chai';
import { findByCallsign } from './find-by-callsign';

// tslint:disable: no-unused-expression

describe('findByCallsign()', () => {
  it('finds FIR by direct ICAO match', () => {
    expect(findByCallsign('LPPO_FSS')).to.be.not.null;
  });

  it('finds FIR by an alias', () => {
    expect(findByCallsign('BOS_CTR')).to.be.not.null;
    expect(findByCallsign('BOS_CTR').icao).to.equal('KZBW');

    expect(findByCallsign('CHI_35_CTR')).to.be.not.null;
    expect(findByCallsign('CHI_35_CTR').icao).to.equal('KZAU');
  });
});
