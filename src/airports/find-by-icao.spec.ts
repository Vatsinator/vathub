import { expect } from 'chai';
import { findByIcao } from './find-by-icao';

describe('findByIcao()', () => {
  it('finds an airport by its full ICAO code', () => {
    const airport = findByIcao('EPWA');
    expect(airport).to.deep.equal({
      icao: 'EPWA', iata: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw',
      state: 'Mazovia', country: 'PL', elevation: 362, lat: 52.1656990051,
      lon: 20.9671001434, tz: 'Europe\/Warsaw',
    });
  });

  it('finds an airport using its alias', () => {
    expect(findByIcao('MTL').icao).to.equal('CYUL');
    expect(findByIcao('ATL').icao).to.equal('KATL');
  });

  it('returns null when there is no such airport', () => {
    // tslint:disable-next-line:no-unused-expression
    expect(findByIcao('ABCD')).to.be.null;
  });
});
