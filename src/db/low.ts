const low = require('lowdb');

import { Database } from './';

const DB = low(`${__dirname}/../../data/db.json`);

const db: Database = {
  defaults(defaults) {
    return DB.defaults(defaults).write();
  },
  push(collection, item) {
    return DB.get(collection).push(item).write();
  },
  update(collection, search, data) {
    db.get(collection).find(search).assign(data).write();
  },
  get(collection, search) {
    if (search) {
      return DB.get(collection).find(search).value();
    }
    else {
      return DB.get(collection).value();
    }
  },
  getRaw(collection, search) {
    if (search) {
      return DB.get(collection).find(search);
    }
    else {
      return DB.get(collection);
    }
  }
};

export default db;
