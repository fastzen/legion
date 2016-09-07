import {MemberService} from '../member-service';
import {Transmittal} from '../models';

export class TransmittalList {

    static inject = [MemberService];
    transmittals = [];

    constructor(memberService){
      this.memberService = memberService;
    }

    heading = 'Transmittal list';

    save(){

    }

    activate(params){

    return this.memberService.getBranch()
      .then(results => {
        this.branch = results;
        return this.memberService.getTransmittals({commandNumber: "01", branchNumber: "092"})
          .then( result => {
            this.transmittals = result.filter( item => { return item instanceof Transmittal } );
        });
      });

    }

    get hasTransmittals(){
      return (this.transmittals.length !==0);
    }

}