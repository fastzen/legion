import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import System from 'systemjs';
import '../config.js';

chai.use(sinonChai);

describe('TransmittalPayment', () => {
  let cuidModule, TransmittalPayment;

  before(() => {
    return System.import('../branch/src/models.js')
      .then((module) => TransmittalPayment = module['TransmittalPayment']);
  });

  describe('New TransmittalPayment', () => {

    it('should have default values', () => {
      let t = new TransmittalPayment(1,2);
      expect(t.version).to.equal(1);
      expect(t.type).to.equal('transmittalpayment');
      expect(t.transmittalId).to.equal(1);
      expect(t.paymentId).to.equal(2);
    });

    it('should have a slug', () => {
      let t = new TransmittalPayment(1,2);
      expect(t._id).to.equal('1:2');
    })

  });

});
