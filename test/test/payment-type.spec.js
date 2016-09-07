import chai, { expect } from 'chai';
import System from 'systemjs';
import '../config.js';

describe('PaymentType', () => {
  let PaymentType;

  let stArray = [
    {name: "New-Full Year", paymentGroup: "Full Year", paymentGroupOrder: 1},
    {name: "New-Half Year", description: "after June 30", paymentGroup: "Half Year", paymentGroupOrder: 2},
    {name: "New-Third Year", description: "after August 31", paymentGroup: "Third Year", paymentGroupOrder: 3},
    {name: "Renewal", paymentGroup: "Full Year", paymentGroupOrder: 1},
    {name: "Reinstated", paymentGroup: "Full Year", paymentGroupOrder: 1},
    {name: "Replacement Card", paymentGroup: "Duplicate Card", paymentGroupOrder: 6}
  ];

  before(() => {
    return System.import('../branch/src/models.js')
      .then((mod) => {
        PaymentType = mod['PaymentType'];
      });
  });

  describe('PaymentType static methods', () => {

    it('should get the payment group for a given payment and payment types', () => {
      let s = {'paymentType': 'New-Full Year'};
      expect( PaymentType.getPaymentGroup(s, stArray) ).to.equal('Full Year');
    });

    it('should get the payment group order for a given payment and payment types', () => {
      let s = {'paymentType': 'New-Full Year'};
      expect( PaymentType.getPaymentGroupOrder(s, stArray) ).to.equal(1);
    });

  });

});
