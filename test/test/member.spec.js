import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import System from 'systemjs';
import '../config.js';

chai.use(sinonChai);

describe('Member', () => {
  let cuidModule, Member;

  before(() => {
    return System.import('ericelliott/cuid/browser-cuid')
      .then((module) => {
        cuidModule = module;
        sinon.stub(cuidModule, 'slug', () => {return 'test'});
      })
      .then(() => System.import('../branch/src/models.js'))
      .then((module) => Member = module['Member']);
  });

  describe('New Member', () => {
    it('should have a first name', () => {
      let m = new Member({ lastName: 'Aitken', firstName: 'Al', dateOfBirth: '1968-04-08'});
      expect(m.firstName).to.equal('Al');
    });
    it('should have a slug', () => {
      let m = new Member({ lastName: 'Aitken', firstName: 'Al', dateOfBirth: '1968-04-08'});
      expect(m._id).to.equal('member:aitken-al-19680408-test');
    });
  });

  after(() => {
    cuidModule.slug.restore();
  });

});
