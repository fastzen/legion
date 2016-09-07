import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import System from 'systemjs';
import '../config.js';

chai.use(sinonChai);

describe('Transmittal', () => {
  let cuidModule, Transmittal, clock;

  before(() => {
    return System.import('ericelliott/cuid/browser-cuid')
      .then((module) => {
        cuidModule = module;
        sinon.stub(cuidModule, 'slug', () => {return 'test'});
        clock = sinon.useFakeTimers(new Date(2015,8,19).getTime());
      })
      .then(() => System.import('../branch/src/models.js'))
      .then((module) => Transmittal = module['Transmittal']);
  });

  describe('New Transmittal', () => {

    it('should have default values', () => {
      let t = new Transmittal({}, {
        'commandNumber': '01',
        'branchNumber': '092',
        'branchName': 'Salt Spring Island'
      });
      expect(t.version).to.equal(1);
      expect(t.type).to.equal('transmittal');
      expect(t.transmittalTotal).to.equal(0);
      expect(t.creditAvailable).to.equal(0);
      expect(t.debitOwing).to.equal(0);
      expect(t.creditAmount).to.equal(0);
      expect(t.debitAmount).to.equal(0);
      expect(t.chequeAmount).to.equal(0);
      expect(t.transmittalDate).to.equal('2015-09-19');
    });

    it('should have a slug', () => {
      let t = new Transmittal({}, {
        'commandNumber': '01',
        'branchNumber': '092',
        'branchName': 'Salt Spring Island'
      });
      expect(t._id).to.equal('command:01:branch:092:transmittal:20150919-test');
    });

    it('should have date parts', () => {
      let t = new Transmittal({}, {
        'commandNumber': '01',
        'branchNumber': '092',
        'branchName': 'Salt Spring Island'
      });
      expect(t.getTransmittalYear()).to.equal('2015');
      expect(t.getTransmittalMonth()).to.equal('09');
      expect(t.getTransmittalDay()).to.equal('19');
    })

  });

  after(() => {
    clock.restore();
    cuidModule.slug.restore();
  });

});
