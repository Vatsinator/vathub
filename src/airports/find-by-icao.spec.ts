import { expect } from 'chai';
import { findByIcao } from './find-by-icao';

// tslint:disable: no-unused-expression

describe('findByIcao()', () => {
  it('finds an airport by its full ICAO code', () => {
    expect(findByIcao('EPWA')).to.not.be.undefined;
  });

  it('returns undefined when there is no such airport', () => {
    expect(findByIcao('ABCD')).to.be.undefined;
  });
});
