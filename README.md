# Aurelia Legion

This is a project to maintain membership records for a branch of the Royal Canadian Legion. It is written for an early version of [Aurelia](http://aurelia.io/).

Local branch membership data is held in [PouchDB](https://pouchdb.com/) within the user's browser.

Data for Dominion Command or Zone Command is held remotely on [Cloudant](https://cloudant.com/) and replicated to the user's browser at startup. This data includes names and addresses of all branches and yearly zone command subscription rates.

## Development

For development I prefer to use [pouchdb-server](https://github.com/pouchdb/pouchdb-server) rather than the browser implementation of PouchDB. Amongst other things, i's easier to clear out a database.

`npm install -g pouchdb-server`

Then run it inside an empty directory, e.g. `data`:

`pouchdb-server -p 15984`

You can view the contents at:

[http://127.0.0.1:15984/_utils](http://127.0.0.1:15984/_utils)

## Installation

`cd branch`

`npm install`

`jspm install`

`gulp watch`

Then navigate to [http://localhost:9000](http://localhost:9000) or whichever URL gulp suggests.

## Tests

In addition to Aurelia unit tests and end-to-end tests, a separate directory `test` holds command line unit tests for the bulk of the models.

`cd test`

`npm install`

`jspm install`

`npm test`

## UI

UI mockups developed with [Pinegrow](http://pinegrow.com/) are located in the `mockups` directory.

## CouchDB

The directory `couchdb` holds dumps of the Cloudant databases.

Produced using [couchdb-dump](https://github.com/danielebailo/couchdb-dump).

[CouchDB Best Practices](http://ehealthafrica.github.io/couchdb-best-practices/) is followed for naming IDs of documents.

## Todo

* Replicate local data from PouchDB to Cloudant as 1) backup and/or 2) to centralize data.
* Encrypt data, perhaps using [crypto-pouch](https://github.com/calvinmetcalf/crypto-pouch).
* Extract PouchDB into a plugin?
* Convert to TypeScript.
* Upgrade to latest Aurelia release
* Move template-branch design documents into code
* Admin frontend for maintaining Cloudant databases.