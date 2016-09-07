import {MemberService} from '../member-service';
import {Person, Member, Payment} from '../models';

export class PaymentList{

  static inject = [MemberService];
  member = {};
  payments = [];

  constructor(memberService){

      this.memberService = memberService;

  }

  heading = 'Payments';

  activate(params){
    return this.memberService.getMemberWithPayments(params.id)
      .then( result => {
        this.member = result.find( item => { return item instanceof Member } );
        this.payments = result.filter( item => { return item instanceof Payment } );
    });
  }

  get hasPayments(){
    return (this.payments.length !== 0);
  }

  delete(payment){
    // TODO: blank out 'Delete' button if payment is part of transmittal
    console.log("PaymentList::delete():5", payment);
    this.memberService.deletePayment(payment).then((result) => {
      console.log("PaymentList::delete():10", result);
      var pos = this.payments.indexOf(payment);
      var removedItem = this.payments.splice(pos, 1);
      // TODO: remove item from payments first, then add back on delete fail.
    }).catch((error) => {
      console.error("PaymentList::delete():20", error);
      this.error = error;
      // this.showing = true;
    });

  }

}
