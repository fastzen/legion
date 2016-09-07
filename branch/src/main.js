import PouchDB from 'pouchdb/pouchdb';

export function configure(aurelia) {

  // Local
  // let localBranchURL = 'branch';
  // let localCommandURL = 'command';
  // let localDominionURL = 'dominion';
  
  // Local Pouch Server
  let localBranchURL = 'http://127.0.0.1:15984/branch';
  let localCommandURL = 'http://127.0.0.1:15984/command';
  let localDominionURL = 'http://127.0.0.1:15984/dominion';
  
  // Remote Cloudant
  let remoteCommandURL = 'https://lanceentortedisionlydryi:d22752e50eef157b542c06574c41a47177d4fae4@fastzen.cloudant.com/command';
  let remoteDominionURL = 'https://tionvyhoughtnightepapedg:fe6517cd54bddb4031f984f9b0509452216d2c6b@fastzen.cloudant.com/command-dominion';
  let remoteTemplateURL = 'https://thistimpurediffeevidenso:278efbe11dd137da56e68654de7be22a3c4490e9@fastzen.cloudant.com/template-branch';
  
  let db = new PouchDB(localBranchURL);
  let commandDB = new PouchDB(localCommandURL);
  let dominionDB = new PouchDB(localDominionURL);

  // Get the latest master design documents for our branch database
  db.replicate.from(remoteTemplateURL).then(function (result) {
    console.info("Template replication", result);
  }).catch(function (err) {
    console.error("Template replication", err);
  });

  commandDB.replicate.from(remoteCommandURL, {
    filter: 'rates/by_command',
    live: false,
    query_params: {command: '01'}
  }).then(function (result) {
    console.info("Command replication", result);
  }).catch(function (err) {
    console.error("Command replication", err);
  });

  // Create this view as we shouldn't really replicate views to PouchDB
  var ddoc = {
    "_id": "_design/rates",
    "views": {
      "rates-by-year": {
        "map": "function(doc) { if(doc.type === 'rates') { emit(doc._id, { rates: doc.rates, currency: doc.currency }); }  }"
      }
    }
  };
  commandDB.put(ddoc).then(function (result) {
    console.info("Command views creation", result);
  }).catch(function (error) {
    console.error("Command views creation", error);
  });

  dominionDB.replicate.from(remoteDominionURL).then(function (result) {
    console.info("Dominion replication", result);
  }).catch(function (err) {
    console.error("Dominion replication", err);
  });

  aurelia.container.registerInstance( 'db', db );
  aurelia.container.registerInstance( 'dominionDB', dominionDB );
  aurelia.container.registerInstance( 'commandDB', commandDB );

  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin('aurelia-animator-css')
    .plugin('aurelia-validation')
    .plugin('aurelia-bs-modal');

  aurelia.globalizeResources('resources/currency-format');

  aurelia.start().then(a => a.setRoot());
}
