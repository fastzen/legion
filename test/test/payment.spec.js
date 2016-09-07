import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import System from 'systemjs';
import '../config.js';

chai.use(sinonChai);

describe('Payment', () => {
  let cuidModule, Payment;

  before(() => {
    return System.import('ericelliott/cuid/browser-cuid')
      .then((module) => {
        cuidModule = module;
        sinon.stub(cuidModule, 'slug', () => {return 'test'});
      })
      .then(() => System.import('../branch/src/models.js'))
      .then((module) => Payment = module['Payment']);
  });

  describe('New Payment', () => {

    it('should have default values', () => {
      let s = new Payment({}, 1);
      expect(s.amountPaid).to.equal(0);
      expect(s.datePaid).to.equal(null);
      expect(s.numberOfYears).to.equal(0);
      expect(s.receiptNumber).to.equal('');
      expect(s.paymentType).to.equal('');
      expect(s.yearPaid).to.equal(0);
      expect(s.member_id).to.equal(1);
      expect(s.version).to.equal(1);
      expect(s.type).to.equal('payment');
    });

    it('should have a slug', () => {
      let s = new Payment({ yearPaid: 2014 }, 1);
      expect(s._id).to.equal('1:payment:2014-test');
    });

  });

  describe('static methods', () => {

    it('should get the most recent payment', () => {
      let s1 = new Payment({ yearPaid: 2014}, 1);
      let s2 = new Payment({ yearPaid: 2015}, 1);
      let yearPaid = Payment.getMostRecentYearPaid([s1, s2]);
      expect(yearPaid).to.equal(2015);
    });

    it('should get the most recent number of years', () => {
      let s1 = new Payment({ numberOfYears: 1}, 1);
      let s2 = new Payment({ numberOfYears: 2}, 1);
      let numberOfYears = Payment.getMostRecentNumberOfYears([s1, s2]);
      expect(numberOfYears).to.equal(2);
    });

  });

  after(() => {
    cuidModule.slug.restore();
  });

});
