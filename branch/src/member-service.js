import {inject} from 'aurelia-framework';
import {Member} from './models';
import {Person} from './models';
import {Payment} from './models';
import {Transmittal} from './models';
import {TransmittalPayment} from './models';
import {Branch} from './models';
import {PaymentRates} from './models';
import {YearRates} from './models';
import {PaymentType} from './models';
import {Command} from './models';

@inject('db', 'dominionDB', 'commandDB')
export class MemberService {

  constructor(db, dominionDB, commandDB){
    this.db = db;
    this.dominionDB = dominionDB;
    this.commandDB = commandDB;
  }

  getMemberById(docId){
    var promise = new Promise( (resolve, reject) => {
      this.db.get(docId).then(function (doc) {
        resolve(new Member(doc));
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  getMemberWithPayments(docId){
    var promise = new Promise( (resolve, reject) => {
      this.db.allDocs({
        "include_docs": true,
        "descending": true,
        "endkey": docId,
        "startkey": docId + ":\ufff0"
      }).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          if (row.doc.type == 'member') {
            return new Member(row.doc);
          } else if (row.doc.type == 'payment') {
            return new Payment(row.doc, docId);
          } else if (row.doc.type == 'transmittalpayment') {
            // TODO: set flag on payment that it can't be deleted until removed from Transmittal
          }
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  saveMember(member){
    var promise = new Promise( (resolve, reject) => {
      this.db.put(member).then(function (result) {
        resolve(result);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  getMembers(){
    var promise = new Promise( (resolve, reject) => {
      this.db.query('members/members-by-name', {include_docs: true}).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          return new Member(row.doc);
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  savePayment(payment){
     var promise = new Promise( (resolve, reject) => {
      this.db.put(payment).then(function (result) {
        resolve(result);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  deletePayment(payment){
    // TODO: prevent if payment is part of a transmittal
    var promise = new Promise( (resolve, reject) => {
      console.log("deletePayment(10)", payment);
      var db = this.db;
      db.get(payment._id).then(function(doc) {
        console.log("deletePayment(20)", doc);
        return db.remove(doc);
      }).then(function (result) {
        resolve(result);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  getTransmittals(branch){
    var promise = new Promise( (resolve, reject) => {
      this.db.query('transmittals/transmittals-by-date/sorting?descending=true', {include_docs: true}).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          return new Transmittal(row.doc, branch);
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  saveTransmittal(transmittal, payments){
    let docs = Array.from(payments, s => new TransmittalPayment(transmittal._id, s._id));
    docs.push(transmittal);
    var promise = new Promise( (resolve, reject) => {
      this.db.bulkDocs(docs).then(function (result) {
        resolve(result);
      }).catch(function (err) {
        reject(err);
      });
    });
    return promise;
  }

  getBranch(){
    var promise = new Promise( (resolve, reject) => {
      this.db.query('branch/branch-by-name', {include_docs: true}).then(function (result) {
        resolve(new Branch(result.rows[0].value));
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  getArrayOfUnallocatedPayments(){
    var promise = new Promise( (resolve, reject) => {
      this.db.query('transmittals/transmittals-payments', {group_level: 1}).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          if(row.value == 1) { return row.key; }
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults.filter( row => { return (row); } ));
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  getPaymentsByArray(array){
    var promise = new Promise( (resolve, reject) => {
      this.db.allDocs({
        "include_docs": true,
        "keys": array
      }).then(function (result) {
        let payments = result.rows.filter( row => { return (row.doc); });
        return Promise.all(payments.map(function (row) {
          return new Payment(row.doc);
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  getTransmittalById(docId){
    var promise = new Promise( (resolve, reject) => {
      this.db.get(docId).then(function (doc) {
        resolve(new Transmittal(doc));
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  getArrayOfPaymentsByTransmittalId(docId){
    var promise = new Promise( (resolve, reject) => {
      this.db.allDocs({
        "include_docs": false,
        "startkey": docId,
        "endkey": docId + ":\ufff0"
      }).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          if(row.id !== docId) {
            return row.id.substr(row.id.split(':', 6).join(':').length + 1);
          }
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults.filter( row => { return typeof row !== "undefined"} ));
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  getTransmittalWithPayments(docId){
    var promise = new Promise( (resolve, reject) => {
      this.db.allDocs({
        "include_docs": true,
        "startkey": docId,
        "endkey": docId + ":\ufff0"
      }).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          if (row.doc.type == 'transmittal') {
            return new Transmittal(row.doc);
          } else if (row.doc.type == 'transmittalpayment') {
            return new Payment(row.doc, docId);
          }
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  deleteTransmittalPayments(array){
    let promise = new Promise( (resolve, reject) => {
      let db = this.db;
      db.allDocs({
        "include_docs": true,
        "keys": array
      }).then( result => {
        return Promise.all(result.rows.map( row => {
          return db.remove(row.doc);
        }));
      }).then( arrayOfResults => {
        resolve(arrayOfResults);
      }).catch( error => {
        reject(error);
      });
    });
    return promise;
  }

  getMembersByArray(array){
    var promise = new Promise( (resolve, reject) => {
      this.db.allDocs({
        "include_docs": true,
        "keys": array
      }).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          return new Member(row.doc);
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  getBranchRates(){
    var promise = new Promise( (resolve, reject) => {
      this.db.query('rates/rates-by-year', {include_docs: true}).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          return new YearRates(row.doc);
          }));
        }).then(function (arrayOfResults) {
          resolve(new PaymentRates(arrayOfResults));
        }).catch(function (error) {
          reject(error);
        });
    });
    return promise;
  }

  getCommandRates(){
    var promise = new Promise( (resolve, reject) => {
      this.commandDB.query('rates/rates-by-year', {include_docs: true}).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          return new YearRates(row.doc);
          }));
        }).then(function (arrayOfResults) {
          resolve(new PaymentRates(arrayOfResults));
        }).catch(function (error) {
          reject(error);
        });
    });
    return promise;
  }

  getPaymentTypes(){
    var promise = new Promise( (resolve, reject) => {
      this.dominionDB.query('data/payment-types-by-name', {include_docs: true}).then(function (result) {
        let doc = result.rows[0].doc;
        return Promise.all(doc.data.map(function (row) {
          return new PaymentType(row);
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  saveRates(rates){
    console.info('MemberService::saveRates(10)', rates);
    var promise = new Promise( (resolve, reject) => {
      this.db.put(rates).then(function (result) {
        resolve(result);
      }).catch(function (error) {
        console.error('MemberService::saveRates(20)', error);
        reject(error);
      });
    });
    return promise;
  }

  getCommands(){
    var promise = new Promise( (resolve, reject) => {
      this.dominionDB.query('commands/commands-by-number', {include_docs: true}).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          return new Command(row.doc);
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  getBranches(commandNumber){
    var promise = new Promise( (resolve, reject) => {
      this.dominionDB.allDocs({
        "include_docs": true,
        "startkey": "command:" + commandNumber + ":branch:",
        "endkey": "command:" + commandNumber + ":branch:\ufff0"
      }).then(function (result) {
        return Promise.all(result.rows.map(function (row) {
          return new Branch(row.doc);
        }));
      }).then(function (arrayOfResults) {
        resolve(arrayOfResults);
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  saveBranch(branch){
    console.info('INFO [MemberService] Saving branch', branch)
    var promise = new Promise( (resolve, reject) => {
      this.db.put(branch).then(function (result) {
        resolve(result);
      }).catch(function (error) {
        console.info('ERROR [MemberService] Error saving branch', error)
        reject(error);
      });
    });
    return promise;
  }

}
