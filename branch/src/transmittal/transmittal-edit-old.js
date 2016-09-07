import {Router} from 'aurelia-router';
import {Validation} from 'aurelia-validation';
import {MemberService} from '../member-service';
import {Transmittal, Payment} from '../models';

export class TransmittalEdit{

  static inject = [Validation, MemberService, Router];
  transmittal = {};
  payments = [];
  heading = 'Transmittal edit';

  constructor(validation, memberService, router){

    this.validation = validation.on(this)
      .ensure('transmittal.totalAmount')
      .isNotEmpty()
      .containsOnlyDigits();

      this.memberService = memberService;
      this.router = router;
  }

  activate(params){
    return this.memberService.getTransmittalById(params.id).then( result => {
      this.transmittal = result;

      let transmittalPaymentsPromise = this.memberService.getArrayOfPaymentsByTransmittalId(params.id).then( results => {
          return this.memberService.getPaymentsByArray(results);
        }).then( results => {
          results.forEach( s => { s.include = true; s.existing = true });
          return(results);
        });

      let unallocatedPaymentsPromise =  this.memberService.getArrayOfUnallocatedPayments().then( results => {
          return this.memberService.getPaymentsByArray(results);
        }).then( results => {
          return(results);
        });

      return Promise.all([transmittalPaymentsPromise, unallocatedPaymentsPromise]).then( results => {
        this.payments = results.reduce( (a, b) => { return a.concat(b) }, [] );

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

          // TODO: add dominion rate

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