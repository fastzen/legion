import {Router} from 'aurelia-router';
import {Validation} from 'aurelia-validation';
import {MemberService} from '../member-service';
import {Member, Payment, YearRates, PaymentRates} from '../models';
import {bindable} from 'aurelia-framework';

export class LifeMembership{

  @bindable showing = false;

  static inject = [Validation, MemberService, Router];
  heading = 'Life Membership';
  member = {};
  payment = {};
  error = {};
  paymentRates = {};
  paymentTypes = [];

  constructor(validation, memberService, router){

    this.validation = validation.on(this)
      .ensure('payment.datePaid')
        .isNotEmpty();

      this.memberService = memberService;

      this.router = router;
  }

  activate(params){

    // getMemberWithPayments
    //    set payment type to 'Life Membership'
    //    .isEligible('Life Membership', numberOfYears)
    //    .yearsDue(currentDate, dateOfBirth)
    //    check dateOfBirth

    // TODO: extract the following into a Factory class

    return this.memberService.getMemberWithPayments(params.id)
      .then(results => {
        this.member = results.filter( result => result.type === 'member')[0];
        let payments = results.filter( result => result.type === 'payment');

        this.payment.previousMembershipType = this.member.membershipType;
        this.payment.paymentType = 'Life Membership';
        let today = new Date();
        this.payment.datePaid = today.toISOString().substr(0,10);
        this.payment.dateOfBirth = this.member.dateOfBirth;
        let dateOfBirth = new Date(Date.parse(this.payment.dateOfBirth));
        this.payment.age = parseInt((Date.now() - (dateOfBirth)) / (31557600000));

        if (payments.length === 0) {
          this.payment.numberOfYears = 1;
          this.payment.yearPaid = parseInt(today.toISOString().substr(0,4));
        } else {
          this.payment.numberOfYears = parseInt(Payment.getMostRecentNumberOfYears(payments));
          this.payment.yearPaid = parseInt(Payment.getMostRecentYearPaid(payments));
        }

        return this.memberService.getCommandRates().then( results => {
          this.paymentRates = results;
          this.payment.amountDuePerYear = this.paymentRates.getRate(this.payment.paymentType, this.payment.yearPaid);

          return this.memberService.getPaymentTypes().then( results => {
            let paymentTypes = results;
            this.paymentTypeObject = paymentTypes.find( pt => {
              return (pt.name == this.payment.paymentType);
            });

            // How many years are due to be paid for a member of this age?
            this.yearsToPayAgeRanges = this.paymentTypeObject.yearsToPayAgeRanges;
            this.yearsToPayAgeRanges.forEach( ar => {
              if(this.payment.numberOfYears >= ar.ageRange[0] && this.payment.numberOfYears <= ar.ageRange[1]){
                this.payment.numberOfYearsDue = ar.yearsToPay;
              }
            });

            this.payment.totalAmountDue = this.payment.amountDuePerYear * this.payment.numberOfYearsDue;

          });

        });

      }).catch(error => console.log(error));
  }

  get hasCommandRatesDefined(){
    return (this.paymentRates.yearRates.length !== 0);
  }

  get hasCorrectMembershipType(){
    return (this.paymentTypeObject.eligibleMembershipTypes.includes(this.member.membershipType));
  }

  get hasEnoughYearsToQualify(){
    return (this.payment.numberOfYears >= this.paymentTypeObject.minYearOnOffer);
  }

  save(){
    this.validation.validate().then( () => {
      let newPayment = new Payment(this.payment, this.member._id);
      this.memberService.savePayment(newPayment).then((result) => {

        console.log("PaymentNew::save():10", result);

        // TODO: change and save member.membershipType
        this.member.membershipType = 'Life Membership';
        var member = new Member(this.member);
        this.memberService.saveMember(member).then((result) => {
          console.log("MemberDetail::save", result);
          this.router.navigateToRoute('payment-list', { id: this.member._id });
        });

        // TODO: if Life Membership payment is deleted then change member.membershipType back to payment.previousMembershipType

      }).catch((error) => {
        console.error("PaymentNew::save():20", error);
        this.error = error;
        this.showing = true;
      });
    }).catch( error => {
      console.error("PaymentNew::save():30", error, this.payment);
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
