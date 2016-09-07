import {Validation} from 'aurelia-validation';
import {Router} from 'aurelia-router';
import {MemberService} from '../member-service';
import {Member, Payment, Transmittal, TransmittalPayment, Branch, PaymentType} from '../models';

export class TransmittalNew {

  static inject = [MemberService, Validation, Router];
  transmittal = {};
  payments = [];
  branch = {};
  paymentTypes = [];
  paymentRates = [];
  heading = 'New transmittal';

  constructor(memberService, validation, router){

    this.memberService = memberService;
    this.validation = validation;
    this.router = router;

    this.validation = validation.on(this)
      .ensure('transmittal.transmittalTotal')
      .isNumber()
      .isNotEmpty();

  }

  activate(params){

    let unallocatedPaymentsPromise =  this.memberService.getArrayOfUnallocatedPayments().then( results => {
        return this.memberService.getPaymentsByArray(results);
    });

    let allPromises = [
      this.memberService.getCommandRates(),
      this.memberService.getPaymentTypes(),
      this.memberService.getBranch(),
      unallocatedPaymentsPromise
    ];

    return Promise.all(allPromises).then( responses => {

      this.paymentRates = responses[0];
      this.paymentTypes = responses[1];
      this.branch = responses[2]
      this.payments = responses[3];

      this.transmittal = new Transmittal({}, this.branch);

      if (this.payments.length === 0 ) { this.hasFlash = true; }

      // add Command payment rates to each payment
      this.payments.forEach( s => {
        let rate = this.paymentRates.getRate(s.paymentType, s.yearPaid, s.numberOfYearsDue);
        s.commandRate = parseFloat(rate.toFixed(2));
      });

      // add member details to payment line items
      let memberSet = new Set();
      this.payments.forEach( s => memberSet.add( s._id.split(":").slice(0,2).join(":") ) );
      this.memberService.getMembersByArray(Array.from(memberSet)).then( results => {

        let members = results;

        // merge members into each payment
        this.payments.forEach( s => {
          let m = members.find( m => m._id == s._id.split(":").slice(0,2).join(":") );
          s.memberFullName = m.lastName + ', ' + m.firstName;
          s.memberNumber = m.memberNumber;
        });

        this.payments.sort( (a, b) => {
          return a.memberFullName.localeCompare(b.memberFullName);
        });

      });

    });

  }

  save(){
    this.validation.validate().then( () => {
        // let newTransmittal = new Transmittal(this.transmittal, this.branch);
        let includePayments = this.payments.filter( item => { return item.include } );
        this.memberService.saveTransmittal(this.transmittal, includePayments).then((result) => {
          console.log("TransmittalNew::save():10", result);
          this.router.navigateToRoute('transmittal-list');
        }).catch((error) => {
          console.error("TransmittalNew::save():20", error);
        });
      }
    ).catch( error => {
      console.error("TransmittalNew::save():30", error);
    });
  }

  updateTotal(event){
    let includes = this.payments.filter( s => s.include );
    let total = 0;
    includes.forEach( s => { total += s.commandRate; })
    this.transmittal.totalAmount = total;
  }

  updateChequeTotal(){
    this.transmittal.chequeTotal = (parseFloat(this.transmittal.transmittalTotal, 10) - parseFloat(this.transmittal.creditAmount, 10) + parseFloat(this.transmittal.debitAmount, 10)).toFixed(2);
  }

}