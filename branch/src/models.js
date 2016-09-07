import toId from 'gr2m/to-id';
import cuid from 'ericelliott/cuid/browser-cuid';

export class Person {

  constructor(data){
    Object.assign(this, data);
    if(!this._id) {
      this._id = this.getSlug();
    }
  }
  getSlug(){
    return 'member:' + toId(this.lastName + '-' + this.firstName + '-' + this.dateOfBirth.substring(0,10).replace(/-/gi, '')) + '-' + cuid.slug();
  }
}

export class Member extends Person {
  constructor(data){
    super(data);
    this.type = this.constructor.name.toLowerCase();
    this.version = 1;
  }
}

export class Payment {
  constructor(data, member_id){
    this.amountPaid = 0;
    this.datePaid = null;
    this.numberOfYears = 0;
    this.receiptNumber = '';
    this.paymentType = '';
    this.yearPaid = 0;
    Object.assign(this, data);
    this.member_id = member_id;
    this.type = this.constructor.name.toLowerCase();
    this.version = 1;
    if(!this._id) {
      this._id = this.getSlug();
    }
  }
  getSlug(){
    return this.member_id + ':payment:' + this.yearPaid + '-' + cuid.slug();
  }
  static getMostRecentYearPaid(payments){
    if(payments.length === 1) { return payments[0].yearPaid; }
    payments.sort( (a, b) => {
      if (a.yearPaid > b.yearPaid) { return 1; }
      if (a.yearPaid < b.yearPaid) { return -1; }
      return 0;
    });
    return payments[payments.length -1].yearPaid;
  }
  static getMostRecentNumberOfYears(payments){
    if(payments.length === 0) { return 0; }
    if(payments.length === 1) { return 1; }
    payments.sort( (a, b) => {
      if (a.yearPaid > b.yearPaid) { return 1; }
      if (a.yearPaid < b.yearPaid) { return -1; }
      return 0;
    });
    return payments[payments.length -1].numberOfYears;
  }
}

export class Transmittal {

  constructor(data, branch){

    this.transmittalTotal = 0;
    this.creditAvailable = 0;
    this.debitOwing = 0;
    this.creditAmount = 0;
    this.debitAmount = 0;
    this.chequeAmount = 0;

    Object.assign(this, data);

    this.type = this.constructor.name.toLowerCase();
    this.version = 1;
    if(!this.transmittalDate) {
      let tzOffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      let localISOTime = (new Date(Date.now() - tzOffset)).toISOString().substr(0,10);
      this.transmittalDate = localISOTime;
    }
    if(!this._id) {
      this.commandNumber = branch.commandNumber;
      this.branchNumber = branch.branchNumber;
      this.branchName = branch.branchName;
      this._id = this.getSlug();
    }
  }
  getSlug(){
    return 'command:' + this.commandNumber + ':branch:' + this.branchNumber + ':' + this.type + ':' + this.transmittalDate.substring(0,10).replace(/-/gi, '') + '-' + cuid.slug();
  }
  getTransmittalYear(){
    return this.transmittalDate.substring(0,4);
  }
  getTransmittalMonth(){
    return this.transmittalDate.substring(5,7);
  }
  getTransmittalDay(){
    return this.transmittalDate.substring(8,10);
  }
}

export class TransmittalPayment {
  constructor(transmittalId, paymentId){
    this.transmittalId = transmittalId;
    this.paymentId = paymentId;
    this.type = this.constructor.name.toLowerCase();
    this.version = 1;
    if(!this._id) {
      this._id = this.getSlug();
    }
  }
  getSlug(){
    return this.transmittalId + ':' + this.paymentId;
  }
}

export class Branch {
  constructor(data){
    Object.assign(this, data);
    this.type = this.constructor.name.toLowerCase();
    this.version = 1;
    if(!this._id) {
      this._id = this.getSlug();
    }
  }

  getSlug(){
    return 'command:' + this.commandNumber + ':branch:' + this.branchNumber;
  }
}

// Collection of all YearRates for the command or the branch.
// Note: PaymentRates is not stored verbatim, only YearRates are stored.
export class PaymentRates {

  constructor(data){
    this.yearRates = data;
    this.type = this.constructor.name.toLowerCase();
    this.version = 1;
  }

  getPaymentTypes(year) {
    return this.yearRates.find(yr => { return (yr.year == year) });
  }

  getPaymentTypesArray(year) {
    let st = this.getPaymentTypes(year);
    return st.rates.reduce( (a, b) => {
      return a.concat(b.paymentType);
    }, []);
  }

  // getYearRates(paymentType) {
  //   let foo = this.yearRates.filter( yrs => {
  //     return yrs.rates.find( yr => {
  //       return yr.paymentType == paymentType;
  //     });
  //   });
  //   let bar = foo.map( yrs => {
  //     return this.getRate(paymentType, yrs.year);
  //   });
  //   return bar;
  // }

  // getYearRatesArray(paymentType) {
  //   let yrs = this.getYearRates(paymentType);
  //   return yrs.reduce( (a, b) => {
  //     return a.concat(b.year);
  //   }, []);
  // }

  getRate(paymentType, year, numberOfYearsDue) {
    let yearRates = this.getPaymentTypes(year);
    if(!yearRates) {
      let mostRecentYear = this.getMostRecentYear();
      yearRates = this.getPaymentTypes(mostRecentYear);
    }
    if(numberOfYearsDue) {
      return ( yearRates.getRate(paymentType).amount * numberOfYearsDue );
    } else {
      return yearRates.getRate(paymentType).amount;
    }
  }

  getRateAsObject(paymentType, year) {
    let yearRates = this.getPaymentTypes(year);
    if(!yearRates) {
      let mostRecentYear = this.getMostRecentYear();
      yearRates = this.getPaymentTypes(mostRecentYear);
    }
    return yearRates.getRate(paymentType);
  }

  getRateAsFloat(paymentType, year) {
    let yearRates = this.getPaymentTypes(year);
    if(!yearRates) {
      let mostRecentYear = this.getMostRecentYear();
      yearRates = this.getPaymentTypes(mostRecentYear);
    }
    return parseFloat(yearRates.getRate(paymentType).amount).toFixed(2)
  }

  getYearOffset(paymentType, year) {
    let yearRates = this.getPaymentTypes(year);
    if(!yearRates) {
      let mostRecentYear = this.getMostRecentYear();
      yearRates = this.getPaymentTypes(mostRecentYear);
    }
    return yearRates.getRate(paymentType).yearOffset;
  }

  getYearsAsArray() {
    return this.yearRates.reduce( (a, b) => {
      return a.concat(b.year);
    }, []);
  }

  /*
   * @param initialOffering - can be either true, false or not supplied, i.e. undefined
   */
  getAllPaymentTypeNames(initialOffering) {
    let a = this.getAllPaymentTypes(initialOffering);
    let s = new Set();
    a.forEach(pt => s.add(pt.paymentType));
    return Array.from(s);
  }

  /*
   * @param initialOffering - can be either true, false or not supplied, i.e. undefined
   */
  getAllPaymentTypes(initialOffering) {
    let s = new Set();
    this.yearRates.forEach( yr => {
      yr.rates.forEach( r => {
        if(typeof initialOffering !== 'undefined') {
          if(r.initialOffering === initialOffering){
            s.add(r);
          }
        } else {
          s.add(r);
        }
      });
    });
    return Array.from(s);
  }

  getCurrency(year) {
    return this.yearRates.find(yr => { return (yr.year == year) }).currency;
  }

  getMostRecentYear() {
    let yearsArray = this.getYearsAsArray();
    return Math.max.apply(null, yearsArray);
  }

  getDefaultPaymentType(month, initialOffering = true) {
    let selectedPaymentType;
    let pts = this.getAllPaymentTypes(initialOffering);
    pts.forEach( pt => {
      let monthsOnOffer = pt.monthsOnOffer;
      if(monthsOnOffer.some(m => parseInt(m) === parseInt(month))){
        selectedPaymentType = pt;
      }
    });
    return selectedPaymentType;
  }

  hasRatesForYear(year) {
    let foo = this.getPaymentTypes(year);
    return (foo === undefined) ? false : true;
  }

}

// Rates for all payment types for a given year.
export class YearRates {

  constructor(data){
    this.rates = data.rates;
    this.currency = data.currency;
    this.year = data.year;
    this.type = this.constructor.name.toLowerCase();
    this.branch = data.branch;
    if(!this._id) {
      this._id = this.getSlug();
    }
    this._rev = data._rev;
  }

  getSlug(){
    if(this.branch !== undefined) {
      return 'command:' + this.branch.commandNumber + ':branch:' + this.branch.branchNumber + ':' + this.type + ':' + this.year;
    }
    else {
      return 'command:none:branch:none:' + this.type + ':' + this.year;
    }
  }

  getPaymentTypeArray() {
    return this.rates.reduce( (a, b) => {
      return a.concat(b.paymentType);
    }, []);
  }

  getRate(paymentType) {
    return this.rates.find(st => { return (st.paymentType == paymentType) });
  }

}

export class PaymentType {

  constructor(data){
    Object.assign(this, data);
  }

  static getPaymentGroup(payment, paymentTypes) {
    return paymentTypes.find( st => {
      return (st.name == payment.paymentType);
    }).paymentGroup;
  }

  static getPaymentGroupOrder(payment, paymentTypes) {
    return paymentTypes.find( st => {
      return (st.name == payment.paymentType);
    }).paymentGroupOrder;
  }

}

// Individual rate for a payment type in a given year.
export class Rate {

  constructor(data){
    this.subscriptionType = '';
    this.amount = 0;
    this.yearOffset = 1;
    this.initialOffering = true;
    Object.assign(this, data);
  }

}

export class Command {
  constructor(data){
    Object.assign(this, data);
    this.type = this.constructor.name.toLowerCase();
    this.version = 1;
    if(!this._id) {
      this._id = this.getSlug();
    }
  }

  getSlug(){
    return 'command:' + this.commandNumber;
  }
}
