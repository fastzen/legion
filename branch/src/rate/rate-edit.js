import {MemberService} from '../member-service';
import {Member, YearRates} from '../models';
import * as _ from 'lodash';

export class RateEdit2 {

  static inject = [MemberService];

  constructor(memberService){
    this.memberService = memberService;
  }

  heading = 'Branch rates';

  // Domain objects
  commandRatesCollection = [];  // Collection of all command rates.
  branchRatesCollection = [];   // Collection of all branch rates.
  branch;
  yearsArray;                   // All years covered by commandRatesCollection (for dropdown box).
  mostRecentYear;               // The most recent year in yearsArray.
  selectedYear;                 // Year selected by user (or auto-selected on start).

  viewPaymentRates;             // ViewModel object.

  activate() {

    let allPromises = [
      this.memberService.getBranchRates(),
      this.memberService.getCommandRates(),
      this.memberService.getBranch()
    ];

    return Promise.all(allPromises).then( responses => {
      this.branchRatesCollection = responses[0];
      this.commandRatesCollection = responses[1];
      this.branch = responses[2];
      this.yearsArray = this.commandRatesCollection.getYearsAsArray();
      this.mostRecentYear = this.arrayMax(this.yearsArray);
    }).catch( error => {
      console.error("RateEdit::activate(10)", error);
    });

  }

  get hasBranchRates(){
    if ( this.branchRatesCollection.yearRates === undefined ) return false;
    if ( this.branchRatesCollection.yearRates.length === 0 ) return false;
    return true;
  }

  save(){
    Object.assign(this.viewPaymentRates, {'branch': {'commandNumber': this.branch.commandNumber, 'branchNumber': this.branch.branchNumber}});
    let yr = new YearRates(this.viewPaymentRates)
    this.memberService.saveRates(yr).then((result) => {
      console.log('RateEdit::save(10)', result);
      let branchRatesCollection = this.memberService.getBranchRates()
        .then(results => this.branchRatesCollection = results);
    });
  }
  
  arrayMax(array) {
    return array.reduce((a, b) => Math.max(a, b));
  }

  yearChanged(){
    this.showRatesForYear(this.selectedYear);
  }

  showRatesForYear(year) {

    let branchYearRates = this.branchRatesCollection.getPaymentTypes(year);

    if(branchYearRates) {
      this.viewPaymentRates = this.showExistingBranchRates(year, this.commandRatesCollection, branchYearRates);
    } else {
      this.viewPaymentRates = this.showNewBranchRates(year, this.commandRatesCollection);
    }

  }

  showExistingBranchRates(year, commandRatesCollection, branchYearRates) {

    let viewPaymentRates = branchYearRates;
    // Merge in the command rates to the ViewModel object
    for(let rate of viewPaymentRates.rates){
      let commandAmount = commandRatesCollection.getRate(rate.paymentType, year);
      rate.commandAmount = commandAmount;
    }
    return viewPaymentRates;

  }

  showNewBranchRates(year, commandRatesCollection) {

    let yearPaymentTypes = commandRatesCollection.getPaymentTypes(year);
    console.info('RateEdit::showNewBranchRates(10)', yearPaymentTypes, commandRatesCollection);

    let viewPaymentRates = _.cloneDeep(yearPaymentTypes);
    delete viewPaymentRates._rev; // remove _rev after assignment

    for(let rate of viewPaymentRates.rates){
      rate.commandAmount = rate.amount;
      rate.amount = 0;
    }

    return viewPaymentRates;

  }

}
