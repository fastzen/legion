import {MemberService} from '../member-service';
import {Member} from '../models';

export class MemberList{

  static inject = [MemberService];
  members = [];

  constructor(memberService){
      this.memberService = memberService;
  }

  heading = 'Membership list';

  activate(){
    return this.memberService.getMembers()
      .then(results => this.members = results);
  }

  get hasMembers(){
    return (this.members.length !== 0);
  }

}
