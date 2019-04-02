import { expect } from 'chai';
import { discoverFlightPhase } from './discover-flight-phase';
import { Pilot } from './models';

describe('discoverFlightPhase()', () => {
  describe('for ground speed > 50', () => {
    it('returns airborne', () => {
      const pilot = { groundSpeed: 417 } as Pilot;
      expect(discoverFlightPhase(pilot)).to.equal('airborne');
    });
  });

  // todo
});
