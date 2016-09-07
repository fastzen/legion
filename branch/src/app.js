import 'bootstrap';
import 'bootstrap/css/bootstrap.css!';

export class App {
  configureRouter(config, router){
    config.title = 'Legion Branch';
    config.map([
      { route: ['','welcome'],            moduleId: './welcome',                       name: 'welcome',                nav: true, title: 'Welcome' },
      { route: 'membership-application',  moduleId: './member/membership-application', name: 'membership-application', nav: true, title: 'New membership' },
      { route: 'member-list',             moduleId: './member/member-list',            name: 'member-list',            nav: true, title: 'Member list' },
      { route: 'transmittal-new',         moduleId: './transmittal/transmittal-new',   name: 'transmittal-new',        nav: true, title: 'New transmittal' },
      { route: 'transmittal-list',        moduleId: './transmittal/transmittal-list',  name: 'transmittal-list',       nav: true, title: 'Transmittal list' },
      { route: 'rate-edit',               moduleId: './rate/rate-edit',                name: 'rate-edit',              nav: true, title: 'Rate edit' },
      { route: 'branch-edit',             moduleId: './branch/branch-edit',            name: 'branch-edit',            nav: true, title: 'Branch edit' },
      { route: 'branch-new',              moduleId: './branch/branch-new',             name: 'branch-new',             nav: true, title: 'Branch new' },
      { route: 'members/:id',             moduleId: './member/member-detail',          name: 'members' },
      { route: 'payment-list/:id',        moduleId: './payment/payment-list',          name: 'payment-list' },
      { route: 'payment-new/:id',         moduleId: './payment/payment-new',           name: 'payment-new' },
      { route: 'duplicate-card/:id',      moduleId: './payment/duplicate-card',        name: 'duplicate-card' },
      { route: 'life-membership/:id',     moduleId: './payment/life-membership',       name: 'life-membership' },
      { route: 'prepayment/:id',          moduleId: './payment/prepayment',            name: 'prepayment' },
      { route: 'transmittal-edit/:id',    moduleId: './transmittal/transmittal-edit',  name: 'transmittal-edit' }
    ]);

    this.router = router;
  }
}
