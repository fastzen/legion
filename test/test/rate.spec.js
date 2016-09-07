import chai, { expect } from 'chai';
import System from 'systemjs';
import '../config.js';

describe('Rate', () => {
  let Rate;

  before(() => {
    return System.import('../branch/src/models.js')
      .then((mod) => {
        Rate = mod['Rate'];
      });
  });

  describe('Rate', () => {
    it('should have defaults', () => {
      let rate = new Rate( {} );
      expect( rate.subscriptionType ).to.equal('');
      expect( rate.amount ).to.equal(0);
      expect( rate.yearOffset ).to.equal(1);
      expect( rate.initialOffering ).to.equal(true);
    });
  });

});
