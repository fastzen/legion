import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import System from 'systemjs';
import '../config.js';

chai.use(sinonChai);

describe('Person', () => {
  let cuidModule, Person;

  before(() => {
    return System.import('ericelliott/cuid/browser-cuid')
      .then((module) => {
        cuidModule = module;
        sinon.stub(cuidModule, 'slug', () => {return 'test'});
      })
      .then(() => System.import('../branch/src/models.js'))
      .then((module) => Person = module['Person']);
  });

  describe('Person module loading', () => {
    it('should load', () => {
      expect(Person.constructor.name.toLowerCase()).to.equal('function');
    });
  });

  describe('Sinon Mocks and Spies', () => {
    it('should mock slug', () => {
      let p = new Person({ lastName: 'Aitken', firstName: 'Al', dateOfBirth: '1968-04-08'});
      expect(p.firstName).to.equal('Al');
    });
  });

  describe('Person', () => {
    it('should have a slug', () => {
      let p = new Person({ lastName: 'Aitken', firstName: 'Al', dateOfBirth: '1968-04-08'});
      expect(p._id).to.equal('member:aitken-al-19680408-test');
    });
  });

  after(() => {
    cuidModule.slug.restore();
  });

});
