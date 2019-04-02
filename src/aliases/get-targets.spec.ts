import chai, { expect } from 'chai';
import chaiArrays from 'chai-arrays';
import { getTargets } from './get-targets';

before(() => {
  chai.use(chaiArrays);
});

describe('getTargets()', () => {
  it('returns all targets', () => {
    const targets = getTargets('MTL');
    expect(targets).to.be.containingAllOf(['CYUL', 'CZUL']);
  });

  it('auto-adds targets for USA airports', () => {
    const targets = getTargets('ATL');
    expect(targets).to.be.containing('KATL');
  });
});
