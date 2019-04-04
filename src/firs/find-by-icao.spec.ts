import { expect } from 'chai';
import { findByIcao } from './find-by-icao';

describe('findByIcao()', () => {
  it('find FIR by its ICAO code', () => {
    const fir = findByIcao('EPWW');
    // tslint:disable-next-line:no-unused-expression
    expect(fir).to.not.be.null;
  });
});
