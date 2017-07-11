import DB from '../../db';
import * as moment from 'moment';
import { find, flatten } from 'lodash';
import { Character } from './characters';

export interface Raid {
  id: string;
  name: string;
  date: Date;
  description: string;
  organizer: string;
  organizerId: string;
  players: Array<Character>;
  waitings: Array<Character>;
  absents: Array<Character>;
}

function _addNewRaid(raidData: Raid): Promise<Raid> {
  return DB.push('raids', raidData);
}

function _getFutureRaids(): Array<Raid> {
  return DB.getAll('raids', e =>
    moment(e.date).startOf('day').isAfter(moment()) &&
    moment(e.date).isBefore(moment().add(14, 'days').endOf('day')));
}

function _getPastRaids(): Array<Raid> {
  return DB.getAll('raids', e =>
    moment(e.date).endOf('day').isBefore(moment()) &&
    moment(e.date).isAfter(moment().subtract(14, 'days').startOf('day')));
}

export default {
  createRaid(name: string, date: string, description: string, organizerId: string, organizer: string): Promise<Raid> {
    return new Promise(resolve => {
      const id = `${name.replace(' ', '_')}-${moment().unix()}`;
      const raidData = {id, name, date: moment(date).toDate(), description, organizerId, organizer, players: [], waitings: [], absents: [] };
      _addNewRaid(raidData);
      resolve(raidData);
    });
  },

  deleteRaid(raidId: string, callerId: string): Promise<boolean> {
    return new Promise( (resolve, reject) => {
      const raid = DB.get('raids', {id: raidId});

      if (!raid) {
        reject(false);
      }

      if (raid.organizerId !== callerId) {
        reject(false);
      }

      DB.remove('raids', {id: raidId});
      resolve(true);
    });
  },

  getRaids(options: string[]): Promise<Array<Raid>> {
    let raids;
    switch (options[0]) {
      case '--past':
        raids = _getPastRaids();
        break;
      case '--date':
        raids = flatten([ DB.get('raids', e =>
          moment(e.date).startOf('day')
            .isSame(moment(options[1]).startOf('day')))
        ]);
        break;
      default:
        raids = _getFutureRaids();
        break;
    }
    return new Promise(resolve => resolve(raids));
  },

  joinRaid(raidId: string, playerId: string, playerName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const raid = DB.get('raids', {id: raidId});

      if (!raid) {
        reject(false);
      }

      const isAlreadyRegistered = find(flatten([raid.players, raid.waitings, raid.absents]), e => e.id === playerId);
      if (!isAlreadyRegistered) {
        DB.getRaw('raids', {id: raidId}).get('waitings').push({ id: playerId, name: playerName }).write();
        resolve(true);
      }
      resolve(false);
    });
  },

  declineRaid(raidId: string, playerId: string, playerName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const raid = DB.get('raids', {id: raidId});

      if (!raid) {
        reject(false);
      }

      const isAlreadyRegistered = find(flatten([raid.players, raid.waitings, raid.absents]), e => e.id === playerId);
      if (!isAlreadyRegistered) {
        DB.getRaw('raids', {id: raidId}).get('absents').push({ id: playerId, name: playerName }).write();
        resolve(true);
      }
      resolve(false);
    });
  },

  accept(raidId: string, playerName: string, callerId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const raid = DB.get('raids', {id: raidId});
      if (!raid) {
        reject(false);
      }

      if (raid.organizerId !== callerId) {
        reject(false);
      }
      const character = DB.getRaw('raids', {id: raidId})
        .get('waitings')
        .find(e => e.name.toLowerCase() === playerName.toLowerCase())
        .value();

      if (!character) {
        reject(false);
      }

      DB.getRaw('raids', {id: raidId})
        .get('players')
        .push(character)
        .write();

      DB.getRaw('raids', {id: raidId})
        .get('waitings')
        .remove(e => e.name.toLowerCase() === playerName.toLowerCase())
        .write();
      resolve(character.id);
    });
  },
};
