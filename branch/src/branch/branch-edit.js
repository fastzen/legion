import {Router} from 'aurelia-router';
import {MemberService} from '../member-service';
import {Branch, Command} from '../models';

export class BranchEdit{

  static inject = [MemberService, Router];

  constructor(memberService, router){
      this.memberService = memberService;
      this.router = router;
  }

  heading = 'Branch edit';
  branch;

  activate(){

    return this.memberService.getBranch()
      .then(results => this.branch = results)
      .catch(error => {
        console.info('BranchEdit::activate(10)', error);
        this.router.navigate('branch-new')
      });

  }

  save(){
    this.memberService.saveBranch(this.branch);
    this.router.navigate('welcome');
  }

}
