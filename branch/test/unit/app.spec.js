import {App} from '../../src/app';

class RouterStub {
  configure(handler) {
    handler(this);
  }
  map(routes) {
    this.routes = routes;
  }
}

describe('the App module', () => {
  var sut
    , mockedRouter;

  beforeEach(() => {
    mockedRouter = new RouterStub();
    sut = new App(mockedRouter);
    sut.configureRouter(mockedRouter, mockedRouter);
  });

  it('contains a router property', () => {
    expect(sut.router).toBeDefined();
  });

  it('configures the router title', () => {
    expect(sut.router.title).toEqual('Legion Branch');
  });

  it('should have a welcome route', () => {
    expect(sut.router.routes).toContain({ route: ['','welcome'], name: 'welcome',  moduleId: './welcome', nav: true, title:'Welcome' });
  });

  it('should have a membership application route', () => {
     expect(sut.router.routes).toContain({ route: 'membership-application', moduleId: './membership-application', name: 'membership-application', nav: true, title:'New membership' });
  });

  it('should have a member list router route', () => {
    expect(sut.router.routes).toContain({ route: 'member-list', moduleId: './member-list', name: 'member-list', nav: true, title:'Member list' });
  });
});
