import {bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {SelectedPaymentsMessage} from '../messages';

export class TransmittalPayments {

  @bindable payments = null;
  @bindable transmittal = null;

  static inject = [EventAggregator];

  constructor(eventAggregator){
      this.eventAggregator = eventAggregator;
  }

  updateTotal(event){
    let includes = this.payments.filter( s => s.include );
    this.eventAggregator.publish(new SelectedPaymentsMessage(includes));
  }
}