import { expect } from 'chai';
import { findByCallsign } from './find-by-callsign';

// tslint:disable: no-unused-expression

describe('findByCallsign()', () => {
  it('finds an airport by direct ICAO match', () => {
    expect(findByCallsign('EGLL_TWR')).to.not.be.undefined;
  });

  it('finds an airport by an alias', () => {
    expect(findByCallsign('ABE_APP')).to.not.be.undefined;
    expect(findByCallsign('MTL_APP').icao).to.equal('CYUL');
  });
});
