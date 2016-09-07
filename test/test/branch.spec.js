import chai, { expect } from 'chai';
import System from 'systemjs';
import '../config.js';

describe('Branch', () => {
  let Branch;

  before(() => {
    return System.import('../branch/src/models.js')
      .then((mod) => {
        Branch = mod['Branch'];
      });
  });

  describe('Branch', () => {
    it('should have defaults', () => {
      let b = new Branch( { lastName: 'Aitken', firstName: 'Al', dateOfBirth: '1968-04-08'} );
      expect( b.type ).to.equal('branch');
      expect( b.version ).to.equal(1);
      expect( b.lastName ).to.equal('Aitken');
    });
  });

});
