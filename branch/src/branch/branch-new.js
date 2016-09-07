import {Router} from 'aurelia-router';
import {MemberService} from '../member-service';
import {Branch, Command} from '../models';

export class BranchNew{

  static inject = [MemberService, Router];

  constructor(memberService, router){
      this.memberService = memberService;
      this.router = router;
  }

  heading = 'Branch new';
  branch;
  commands;
  branches;
  branchSet;

  hasBranch(){
    return this.memberService.getBranch()
      .then(results => this.branchSet = true )
      .catch(error => this.branchSet = false );
  }

  getCommands(){
    return this.memberService.getCommands()
      .then(results => this.commands = results);
    }

  getBranches(commandNumber){
    return this.memberService.getBranches(commandNumber)
      .then(results => this.branches = results)
      .catch(error => console.log(error));
  }

  activate(){

    this.branch = new Branch();

    let gets = [this.getCommands()];

    this.hasBranch();

    return Promise.all( gets )
      .then(results => console.info('INFO [branch] Fetched commands and branch'))
      .catch(results => console.info(results));

  }

  save(){
    delete this.branch._rev
    this.memberService.saveBranch(this.branch);
    this.router.navigate('welcome');
  }

  commandChange(){
    if(this.branch.commandNumber){
      this.getBranches(this.branch.commandNumber);
    }
    this.showBranch = false;
  }

  branchChange(){
    if(this.branch.branchNumber){
      this.showBranch = true;
    }
  }

}
