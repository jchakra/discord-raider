import db from './low';

export interface Database {
  defaults(defaults: object): any;
  push(collection: string, item: object): any;
  update(collection: string, search: object, data: object): any;
  remove(collection: string, search: object): any;
  get(collection: string, search?: object): any;
  getAll(collection: string, search?: object): any;
  getRaw(collection: string, search?: object): any;
}

export default db;
