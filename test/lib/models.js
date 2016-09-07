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

export class Subscription {
  constructor(data, member_id){

    this.amountPaid = 0;
    this.datePaid = null;
    this.numberOfYears = 0;
    this.receiptNumber = '';
    this.subscriptionType = '';
    this.yearPaid = 0;
    this.member_id = member_id;

    Object.assign(this, data);
    this.type = this.constructor.name.toLowerCase();
    this.version = 1;
    if(!this._id) {
      this._id = this.getSlug();
    }
  }
  getSlug(){
    return this.member_id + ':subscription:' + this.yearPaid;
  }
  static getMostRecentYearPaid(subscriptions){
    if(subscriptions.length == 1) { return 0; }
    subscriptions.sort( (a, b) => {
      if (a.yearPaid > b.yearPaid) { return 1; }
      if (a.yearPaid < b.yearPaid) { return -1; }
      return 0;
    });
    return subscriptions[subscriptions.length -1].yearPaid;
  }
  static getMostRecentNumberOfYears(subscriptions){
    if(subscriptions.length == 1) { return 0; }
    subscriptions.sort( (a, b) => {
      if (a.yearPaid > b.yearPaid) { return 1; }
      if (a.yearPaid < b.yearPaid) { return -1; }
      return 0;
    });
    return subscriptions[subscriptions.length -1].numberOfYears;
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
    return 'command:' + this.commandNumber + ':branch:' + this.branchNumber + ':transmittal:' + this.transmittalDate.substring(0,10).replace(/-/gi, '') + '-' + cuid.slug();
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

export class TransmittalSubscription {
  constructor(transmittalId, subscriptionId){
    this.transmittalId = transmittalId;
    this.subscriptionId = subscriptionId;
    this.type = this.constructor.name.toLowerCase();
    this.version = 1;
    if(!this._id) {
      this._id = this.getSlug();
    }
  }
  getSlug(){
    return this.transmittalId + ':' + this.subscriptionId;
  }
}

export class Branch {
  constructor(data){
    Object.assign(this, data);
    this.type = this.constructor.name.toLowerCase();
    this.version = 1;
  }
}

export class SubscriptionRates {

  constructor(data){
    this.yearRates = data;
  }

  getSubscriptionTypes(year) {
    return this.yearRates.find(yr => { return (yr.year == year) });
  }

  getSubscriptionTypesArray(year) {
    let st = this.getSubscriptionTypes(year);
    return st.rates.reduce( (a, b) => {
      return a.concat(b.subscriptionType);
    }, []);
  }

  getYearRates(subscriptionType) {
    let foo = this.yearRates.filter( yrs => {
      let bar = yrs.rates.find( yr => {
        return yr.subscriptionType == subscriptionType;
      });
      return bar.subscriptionType == subscriptionType;
    });
    return foo;
  }

  getYearRatesArray(subscriptionType) {
    let yrs = this.getYearRates(subscriptionType);
    return yrs.reduce( (a, b) => {
      return a.concat(b.year);
    }, []);
  }

  getRate(subscriptionType, year) {
    let yearRates = this.getSubscriptionTypes(year);
    return yearRates.getRate(subscriptionType).amount;
  }

  getYearOffset(subscriptionType, year) {
    let yearRates = this.getSubscriptionTypes(year);
    return yearRates.getRate(subscriptionType).yearOffset;
  }

  getYearsAsArray() {
    return this.yearRates.reduce( (a, b) => {
      return a.concat(b.year);
    }, []);
  }

  getSubscriptionTypesAsArray() {
    let s = new Set();
    this.yearRates.forEach( yr => {
      yr.rates.forEach( r => { s.add(r.subscriptionType); });
    });
    return Array.from(s);
  }

  getCurrency(year) {
    return this.yearRates.find(yr => { return (yr.year == year) }).currency;
  }

}

export class YearRates {

  constructor(data){
    this.rates = data.rates;
    this.currency = data.currency;
    this.year = data.year;
  }

  getSubscriptionTypeArray() {
    return this.rates.reduce( (a, b) => {
      return a.concat(b.subscriptionType);
    }, []);
  }

  getRate(subscriptionType) {
    return this.rates.find(st => { return (st.subscriptionType == subscriptionType) });
  }

}

export class SubscriptionType {

  constructor(data){
    Object.assign(this, data);
  }

  static getPaymentGroup(subscription, subscriptionTypes) {
    return subscriptionTypes.find( st => {
      return (st.name == subscription.subscriptionType);
    }).paymentGroup;
  }

  static getPaymentGroupOrder(subscription, subscriptionTypes) {
    return subscriptionTypes.find( st => {
      return (st.name == subscription.subscriptionType);
    }).paymentGroupOrder;
  }

}