import chai, { expect } from 'chai';
import System from 'systemjs';
import '../config.js';

describe('YearRates', () => {
  let YearRates;

  let rates2014 = {
    rates: [
      {paymentType: 'New-Full Year', amount: 65, yearOffset: 1, initialOffering: true},
      {paymentType: 'New-Half Year', amount: 35, yearOffset: 1, initialOffering: true},
      {paymentType: 'Renewal', amount: 65, yearOffset: 1, initialOffering: false},
      {paymentType: 'Reinstated', amount: 65, yearOffset: 1, initialOffering: false},
      {paymentType: 'Replacement Card', amount: 5, yearOffset: 0, initialOffering: false}
    ],
    currency: 'CAD',
    year: 2014
  };

  before(() => {
    return System.import('../branch/src/models.js')
      .then((mod) => {
        YearRates = mod['YearRates'];
      });
  });

  describe('YearRates', () => {

    it('should have a constructor', () => {
      let yr = new YearRates(rates2014);
      expect( yr.currency ).to.equal('CAD');
      expect( yr.year ).to.equal(2014);
    });

    it('should return a payment types array', () => {
      let yr = new YearRates(rates2014);
      expect( yr.getPaymentTypeArray()).to.have.members([
        'New-Full Year',
        'New-Half Year',
        'Renewal',
        'Reinstated',
        'Replacement Card'
      ]);
    });

    it('should return the rate for a given payment type', () => {
      let yr = new YearRates(rates2014);
      expect(yr.getRate('New-Full Year').amount).to.equal(65);
      expect(yr.getRate('New-Full Year').yearOffset).to.equal(1);
      expect(yr.getRate('New-Full Year').initialOffering).to.equal(true);
    });

    it('should return a new branch YearRates object', () => {
    });

  });

});
