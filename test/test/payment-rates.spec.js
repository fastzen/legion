import chai, { expect } from 'chai';
import System from 'systemjs';
import '../config.js';

describe('PaymentRates', () => {
  let PaymentRates, YearRates, clock;

  let rates2013 = {
    rates: [
      {paymentType: 'New-Full Year', amount: 60, yearOffset: 1, initialOffering: true},
      {paymentType: 'New-Half Year', amount: 30, yearOffset: 1, initialOffering: true},
      {paymentType: 'Renewal', amount: 60, yearOffset: 1, initialOffering: false},
      {paymentType: 'Reinstated', amount: 60, yearOffset: 1, initialOffering: false},
      {paymentType: 'Replacement Card', amount: 5, yearOffset: 0, initialOffering: false}
    ],
    currency: 'CAD',
    year: 2013
  };

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
        PaymentRates = mod['PaymentRates'];
        YearRates = mod['YearRates'];
      });
  });

  describe('PaymentRates', () => {

    it('should have defaults', () => {
      let sr = new PaymentRates({});
      expect( sr.type ).to.equal('paymentrates');
      expect( sr.version ).to.equal(1);
    });

    it('should have yearRates', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.yearRates.length).to.equal(2);
    });

    it('should return the yearRates for a given year', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.getPaymentTypes(2013)).to.equal(yr2013);
    });

    it('should return an array of payment types for a given year', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.getPaymentTypesArray(2013)).to.have.members([
        'New-Full Year',
        'New-Half Year',
        'Renewal',
        'Reinstated',
        'Replacement Card'
        ]);
    });

    // it('should return year rates containing a payment type', () => {
    //   rates2013.rates.push({paymentType: 'Test', amount: 5, yearOffset: 0, initialOffering: false});
    //   let yr2013 = new YearRates(rates2013);
    //   let yr2014 = new YearRates(rates2014);
    //   let sr = new PaymentRates([yr2013, yr2014]);
    //   expect(sr.getYearRates('Test')).to.have.members([yr2013]);
    // });

    // it('should return an array of year rates containing a payment type', () => {
    //   rates2013.rates.push({paymentType: 'Test', amount: 5, yearOffset: 0, initialOffering: false});
    //   let yr2013 = new YearRates(rates2013);
    //   let yr2014 = new YearRates(rates2014);
    //   let sr = new PaymentRates([yr2013, yr2014]);
    //   expect(sr.getYearRatesArray('Test')).to.have.members([2013]);
    // });

    it('should return the amount for a given payment type and year', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.getRate('New-Full Year', 2013)).to.equal(60);
    });

    it('should return the most recent amount for a given payment type and year that does not exist', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.getRate('New-Full Year', 2012)).to.equal(65);
      expect(sr.getRate('New-Full Year', 2015)).to.equal(65);
    });

    it('should return the year offset for a given payment type and year', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.getYearOffset('New-Full Year', 2013)).to.equal(1);
      expect(sr.getYearOffset('Replacement Card', 2013)).to.equal(0);
    });

    it('should return an array of years', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.getYearsAsArray()).to.have.members([2013, 2014]);
    });

    it('should return an array of payment types', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.getAllPaymentTypeNames()).to.have.members([
        'New-Full Year',
        'New-Half Year',
        'Renewal',
        'Reinstated',
        'Replacement Card'
      ]);
    });

    it('should return the currency for a given year', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.getCurrency(2013)).to.equal('CAD');
    });

    it('should return the most recent year', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.getMostRecentYear()).to.equal(2014);
    });

    it('should confirm whether the rates exist for a given year', () => {
      let yr2013 = new YearRates(rates2013);
      let yr2014 = new YearRates(rates2014);
      let sr = new PaymentRates([yr2013, yr2014]);
      expect(sr.hasRatesForYear(2013)).to.equal(true);
      expect(sr.hasRatesForYear(2015)).to.equal(false);
    });

  });

  after(() => {
  });


});
