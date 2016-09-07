import {Router} from 'aurelia-router';
import {Validation} from 'aurelia-validation';
import {MemberService} from '../member-service';
import {Transmittal, Payment} from '../models';

export class TransmittalEdit {

  static inject = [MemberService, Validation, Router];
  transmittal = {};
  payments = [];
  branch = {};
  paymentTypes = [];
  paymentRates = [];
  heading = 'Transmittal edit';

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

    return this.memberService.getTransmittalById(params.id).then( result => {

      this.transmittal = result;

      let transmittalPaymentsPromise = this.memberService.getArrayOfPaymentsByTransmittalId(params.id).then( results => {
          return this.memberService.getPaymentsByArray(results);
      });

      let unallocatedPaymentsPromise =  this.memberService.getArrayOfUnallocatedPayments().then( results => {
          return this.memberService.getPaymentsByArray(results);
      });

      let allPromises = [
        this.memberService.getCommandRates(),
        this.memberService.getPaymentTypes(),
        transmittalPaymentsPromise,
        unallocatedPaymentsPromise
      ];

      return Promise.all(allPromises).then( responses => {

        this.paymentRates = responses[0];
        this.paymentTypes = responses[1];
        let transmittalPayments = responses[2];
        let unallocatedPayments = responses[3];

        // set the include flag for transmittal payments
        transmittalPayments.forEach( s => { s.include = true; s.existing = true });
        Array.prototype.push.apply(transmittalPayments, unallocatedPayments);

        this.payments = transmittalPayments.reduce( (a, b) => { return a.concat(b) }, [] );

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

    });

  }

  save(){
    this.validation.validate().then( () => {
        // Remove existing unselected transmittalPayments.
        let removeTransmittalPaymentsArray = [];
        this.payments.forEach( s => {
          if(s.existing && !s.selected) {
            removeTransmittalPaymentsArray.push(this.transmittal._id + ':' + s._id)
          }
        });
        console.error("TransmittalEdit::save():5");
        this.memberService.deleteTransmittalPayments(removeTransmittalPaymentsArray).then(result => {
          let newTransmittal = new Transmittal(this.transmittal);
          let includePayments = this.payments.filter( item => { return item.include } );
          this.memberService.saveTransmittal(newTransmittal, includePayments).then((result) => {
            this.router.navigateToRoute('transmittal-list');
          }).catch((error) => {
            console.error("TransmittalEdit::save():10", error);
          });
        }).catch(error => {
          console.log("TransmittalEdit::save():20", error);
        });
      }
    ).catch( error => {
      console.error("TransmittalEdit::save():30", error);
    });
  }

}