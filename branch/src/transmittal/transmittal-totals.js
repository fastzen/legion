import {bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {MemberService} from '../member-service';
import {SelectedPaymentsMessage} from '../messages';
import {PaymentType} from '../models';

export class TransmittalTotals {

  @bindable transmittal = null;
  @bindable payments = null;
  @bindable paymentTypes = null;

  payments = null;

  static inject = [EventAggregator, MemberService];

  constructor(eventAggregator, memberService){
    this.eventAggregator = eventAggregator;
    this.memberService = memberService;
    this.subscribe();
  }

  subscribe(){
    this.eventAggregator.subscribe(SelectedPaymentsMessage, message => {
      console.log("TransmittalTotals::subscribe(10)", message);
      this.updatePayments(message.payments);
    });
  }

  bind(params){

    console.log("TransmittalTotals::bind(10)", this.transmittal);
    console.log("TransmittalTotals::bind(20)", this.payments);
    console.log("TransmittalTotals::bind(30)", this.paymentTypes);
    console.log("TransmittalTotals::bind(40)", params.paymentTypes);
    this.paymentTypes = params.paymentTypes;  // TODO: not sure why we need to do this

    let includes = this.payments.filter( s => s.include );
    this.updatePayments(includes);

  }

  updateCreditAmount(){
    this.creditAmount = parseFloat(this.creditAvailable, 10);
  }

  updateDebitAmount(){
    this.debitAmount = parseFloat(this.debitOwing, 10);
  }

  updatePayments(payments){

    payments.forEach( payment => {
      let pg = PaymentType.getPaymentGroup(payment, this.paymentTypes);
      payment.paymentGroup = pg;
    });

    let paymentGroups = new Set();
    payments.forEach( payment => {
      paymentGroups.add({
        'paymentCount': 0,
        'paymentGroup': payment.paymentGroup,
        'paymentYear': payment.yearPaid,
        'paymentRate': 0,
        'paymentAmountRemitted': 0
      });
    });

    // For each group, add a payment entry
    paymentGroups.forEach( paymentGroup => {

      payments.forEach( payment => {

        if(paymentGroup.paymentGroup == payment.paymentGroup && paymentGroup.paymentYear == payment.yearPaid) {
          paymentGroup.paymentCount += 1;
          paymentGroup.paymentRate = payment.commandRate;
          paymentGroup.paymentAmountRemitted += payment.commandRate;
        }

      });

    });

    this.payments = Array.from(paymentGroups);

    // Calculate totals
    let total = 0;
    payments.forEach( s => { total += s.commandRate; })
    this.transmittal.transmittalTotal = total;
    this.transmittal.paymentsCount = payments.length;
    this.updateChequeTotal();
  }

  updateChequeTotal(){
    this.transmittal.chequeTotal = (parseFloat(this.transmittal.transmittalTotal, 10) - parseFloat(this.transmittal.creditAmount, 10) + parseFloat(this.transmittal.debitAmount, 10)).toFixed(2);
  }

}