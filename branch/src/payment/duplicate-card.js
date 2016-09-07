import {Router} from 'aurelia-router';
import {Validation} from 'aurelia-validation';
import {MemberService} from '../member-service';
import {Member, Payment, YearRates, PaymentRates} from '../models';
import {bindable} from 'aurelia-framework';

export class DuplicateCard{

  @bindable showing = false;

  static inject = [Validation, MemberService, Router];
  heading = 'Duplicate card';
  member = {};
  payment = {};
  error = {};
  paymentRates = {};
  paymentTypes = [];

  constructor(validation, memberService, router){

    this.validation = validation.on(this)
      .ensure('payment.paymentType')
        .isNotEmpty()
      .ensure('payment.amountPaid')
        .isNotEmpty()
      .ensure('payment.datePaid')
        .isNotEmpty()
      .ensure('payment.yearPaid')
        .isNotEmpty()
        .containsOnlyDigits();

    this.memberService = memberService;

    this.router = router;

  }

  activate(params){

    return this.memberService.getMemberWithPayments(params.id)
      .then(results => {
        this.member = results.filter( result => result.type === 'member')[0];
        let payments = results.filter( result => result.type === 'payment');

        this.payment.paymentType = 'Duplicate Card';
        let today = new Date();
        this.payment.datePaid = today.toISOString().substr(0,10);

        if (payments.length === 0) {
          // this.payment.numberOfYears = 1;
          this.payment.yearPaid = parseInt(today.toISOString().substr(0,4));
          console.log('DuplicateCard::activate(10)', this.payment.numberOfYears, this.payment.yearPaid);
        } else {
          // this.payment.numberOfYears = parseInt(Payment.getMostRecentNumberOfYears(payments)) + 1;
          this.payment.yearPaid = parseInt(Payment.getMostRecentYearPaid(payments));
          console.log('DuplicateCard::activate(20)', this.payment.numberOfYears, this.payment.yearPaid);
        }

        return this.memberService.getBranchRates().then( results => {
          this.paymentRates = results;
          this.paymentTypes = this.paymentRates.getAllPaymentTypeNames(false);
          this.paymentTypeChanged();
        });

      }).catch(error => console.log(error));
  }

  attached(){
  }

  get hasBranchRatesDefined(){
    return (this.paymentRates.yearRates.length !== 0);
  }

  paymentTypeChanged(){
    let paymentType = this.payment.paymentType;
    console.log('DuplicateCard::paymentTypeChanged(15)', this.paymentRates);
    let rate = this.paymentRates.getRate(paymentType, this.payment.yearPaid);
    console.log('DuplicateCard::paymentTypeChanged(20)', rate);
    this.payment.amountPaid = parseFloat(rate).toFixed(2);
  // TODO: some paymentTypes, i.e. Replacement Card, have no impact upon yearPaid or numberOfYears
  // update yearPaid, update numberOfYears
  }

  yearPaidChanged(){
    let paymentType = this.payment.paymentType;
    let rate = this.paymentRates.getRate(paymentType, this.payment.yearPaid);
    this.payment.amountPaid = parseFloat(rate).toFixed(2);
  // TODO: some paymentTypes, i.e. Replacement Card, have no impact upon yearPaid or numberOfYears
  //       BUT: we'll have separate views for no 'impact' paymentsTypes.
  // update yearPaid, update numberOfYears
    let yearOffset = this.paymentRates.getYearOffset(paymentType, this.payment.yearPaid);
    console.log("yearOffset", yearOffset);
  // IF: yearOffset == 0 then changed number of years to current numberOfyears + 0
  }

  save(){
    this.validation.validate().then( () => {
      let newPayment = new Payment(this.payment, this.member._id);
      this.memberService.savePayment(newPayment).then((result) => {
        console.log("DuplicateCard::save():10", result);
        this.router.navigateToRoute('payment-list', { id: this.member._id });
      }).catch((error) => {
        console.error("DuplicateCard::save():20", error);
        this.error = error;
        this.showing = true;
      });
    }).catch( error => {
      console.error("DuplicateCard::save():30", error, this.payment);
      this.error = error;
      this.showing = true;
    });
  }

  /* Modal form handlers */
  closeEventGoesHere(){
    this.showing = false;
  }
  cancelEventGoesHere(){
    this.showing = false;
  }
  saveFunction(){
    this.showing = false;
  }



}