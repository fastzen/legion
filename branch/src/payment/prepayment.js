import {Router} from 'aurelia-router';
import {Validation} from 'aurelia-validation';
import {MemberService} from '../member-service';
import {Member, Payment, YearRates, PaymentRates} from '../models';
import {bindable} from 'aurelia-framework';

export class Prepayment{

  @bindable showing = false;

  static inject = [Validation, MemberService, Router];
  heading = 'Prepayment';
  member = {};
  payment = {};
  error = {};
  paymentRates = {};
  paymentTypes = [];

  constructor(validation, memberService, router){

    this.validation = validation.on(this)
      .ensure('payment.paymentType')
        .isNotEmpty()
      .ensure('payment.totalAmountPaid')
        .isNotEmpty()
      .ensure('payment.datePaid')
        .isNotEmpty()
      .ensure('payment.yearPaid')
        .isNotEmpty()
        .containsOnlyDigits()
      .ensure('payment.numberOfYears')
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

        this.payment.paymentType = 'Prepaid';
        let today = new Date();
        this.payment.datePaid = today.toISOString().substr(0,10);

        this.payment.numberOfYearsPrepaid = 1;
        if (payments.length === 0) {
          this.payment.numberOfYears = 1;
          this.payment.yearPaid = parseInt(today.toISOString().substr(0,4));
          console.log('PaymentNew::activate(10)', this.payment.numberOfYears, this.payment.yearPaid);
        } else {
          this.payment.numberOfYears = parseInt(Payment.getMostRecentNumberOfYears(payments)) + 1;
          this.payment.yearPaid = parseInt(Payment.getMostRecentYearPaid(payments)) + 1;
          console.log('PaymentNew::activate(20)', this.payment.numberOfYears, this.payment.yearPaid, payments);
        }

        return this.memberService.getBranchRates().then( results => {
          this.paymentRates = results;
          this.numberOfYearsPrepaidChanged();
        });

      }).catch(error => console.log(error));
  }

  attached(){
  }

  get hasBranchRatesDefined(){
    return (this.paymentRates.yearRates.length !== 0);
  }

  numberOfYearsPrepaidChanged(){
    let numberOfYearsPrepaid = this.payment.numberOfYearsPrepaid;
    let rate = this.paymentRates.getRate('Renewal', this.payment.yearPaid);
    console.log('Prepayment::numberOfYearsPrepaidChanged(10)', numberOfYearsPrepaid, rate);
    this.payment.totalAmountPaid = numberOfYearsPrepaid * rate;
  }

  save(){

    let numberOfYearsPrepaid = this.payment.numberOfYearsPrepaid;
    let promisesArray = [];

    this.validation.validate().then( () => {

      // Create a payment for each year.
      for (var i = 0; i <= numberOfYearsPrepaid - 1; i++) {

        let rate = this.paymentRates.getRate(this.payment.paymentType, this.payment.yearPaid);

        this.payment.amountPaid = rate;
        let newPayment = new Payment(this.payment, this.member._id);
        console.log('Prepayment::save(30)', newPayment);
        let promise = this.memberService.savePayment(newPayment);
        promisesArray.push( promise );
        this.payment.numberOfYears++;
        this.payment.yearPaid++;
      }
      console.log('Prepayment::save(40)', promisesArray);

      this.router.navigateToRoute('payment-list', { id: this.member._id });
      return promisesArray;

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